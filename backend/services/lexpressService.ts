import crypto from "crypto";
import { pool } from "../config/db";
import { getCountryIdByName } from "./countryService";
import { getOrCreateFormationByName } from "./formationService";

export const fetchLexpressSubmissions = async () => {
  const rawUrl =
    process.env.LEXPRESS_API_URL ||
    "https://lexpress-education.com/wp-json/sws";
  const apiUrl = rawUrl.replace(/\/$/, "");

  const wpUser = (process.env.LEXPRESS_USER || "").trim();
  const wpPassword = (process.env.LEXPRESS_API_KEY || "").replace(/\s+/g, "");

  if (!wpUser || !wpPassword) {
    throw new Error("Les identifiants WordPress sont manquants dans le .env");
  }

  const credentials = Buffer.from(`${wpUser}:${wpPassword}`).toString("base64");

  let allSubmissions: any[] = [];
  let page = 1;
  const perPage = 100;
  let hasMore = true;

  try {
    while (hasMore) {
      const response = await fetch(
        `${apiUrl}/submissions?per_page=${perPage}&page=${page}`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${credentials}`,
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        if (page > 1 && (response.status === 400 || response.status === 404)) {
          break;
        }
        const errorText = await response.text();
        console.error(`Erreur HTTP ${response.status}:`, errorText);
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      const items = Array.isArray(data) ? data : data.data || [];

      if (items.length === 0) {
        hasMore = false;
      } else {
        allSubmissions = allSubmissions.concat(items);
        if (items.length < perPage) {
          hasMore = false;
        } else {
          page++;
        }
      }
    }

    const fetchWithTimeout = async (
      url: string,
      options: any,
      timeout = 5000,
    ) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(id);
        return response;
      } catch (error) {
        clearTimeout(id);
        throw error;
      }
    };

    const detailedSubmissions = [];
    const batchSize = 10;

    for (let i = 0; i < allSubmissions.length; i += batchSize) {
      const batch = allSubmissions.slice(i, i + batchSize);

      const batchPromises = batch.map(async (sub) => {
        try {
          const detailRes = await fetchWithTimeout(
            `${apiUrl}/submissions/${sub.id}`,
            {
              method: "GET",
              headers: {
                Authorization: `Basic ${credentials}`,
                Accept: "application/json",
              },
            },
          );

          if (detailRes.ok) {
            const detailData = await detailRes.json();
            return { ...sub, ...detailData };
          }
        } catch (err) {}

        return sub;
      });

      const batchResults = await Promise.all(batchPromises);
      detailedSubmissions.push(...batchResults);
    }

    return detailedSubmissions;
  } catch (error: any) {
    console.error(
      "Erreur lors de la récupération des prospects L'Express:",
      error.message,
    );
    throw new Error("Impossible de récupérer les données de l'API L'Express");
  }
};

export const fetchLatestLexpressSubmissions = async () => {
  const rawUrl =
    process.env.LEXPRESS_API_URL ||
    "https://lexpress-education.com/wp-json/sws";
  const apiUrl = rawUrl.replace(/\/$/, "");

  const wpUser = (process.env.LEXPRESS_USER || "").trim();
  const wpPassword = (process.env.LEXPRESS_API_KEY || "").replace(/\s+/g, "");

  if (!wpUser || !wpPassword) {
    throw new Error("Les identifiants WordPress sont manquants dans le .env");
  }

  const credentials = Buffer.from(`${wpUser}:${wpPassword}`).toString("base64");

  try {
    const response = await fetch(`${apiUrl}/submissions/latest?per_page=50`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur HTTP ${response.status}:`, errorText);
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    const items = Array.isArray(data) ? data : data.data || [];

    const fetchWithTimeout = async (
      url: string,
      options: any,
      timeout = 5000,
    ) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(id);
        return response;
      } catch (error) {
        clearTimeout(id);
        throw error;
      }
    };

    const detailedSubmissions = [];
    for (const sub of items) {
      try {
        const detailRes = await fetchWithTimeout(
          `${apiUrl}/submissions/${sub.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Basic ${credentials}`,
              Accept: "application/json",
            },
          },
        );

        if (detailRes.ok) {
          const detailData = await detailRes.json();
          detailedSubmissions.push({ ...sub, ...detailData });
          continue;
        }
      } catch (err) {}
      detailedSubmissions.push(sub);
    }

    return detailedSubmissions;
  } catch (error: any) {
    console.error(
      "Erreur lors de la récupération des derniers prospects L'Express:",
      error.message,
    );
    throw new Error(
      "Impossible de récupérer les derniers prospects de l'API L'Express",
    );
  }
};

export const syncLatestLexpressSubmissionsToDb = async () => {
  const items = await fetchLatestLexpressSubmissions();
  return await processSubmissionsInsertion(items);
};

export const processSubmissionsInsertion = async (items: any[]) => {
  const franceId = await getCountryIdByName("France");
  let processedCount = 0;

  for (const sub of items) {
    const lexpressId = String(sub.id);
    const rawFormation = sub.programme || sub.formation || null;
    const formationId = await getOrCreateFormationByName(rawFormation);

    try {
      const [existingRows]: any = await pool.query(
        "SELECT id FROM prospects WHERE lexpress_id = ?",
        [lexpressId],
      );

      const isNew = existingRows.length === 0;
      const prospectUuid = isNew ? crypto.randomUUID() : existingRows[0].id;

      const query = `
        INSERT INTO prospects (
          id, lexpress_id, email, first_name, last_name, phone, gender, 
          status_id, country_id, formation_id, last_action_date
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE 
          email = VALUES(email),
          first_name = VALUES(first_name),
          last_name = VALUES(last_name),
          phone = VALUES(phone),
          gender = VALUES(gender),
          formation_id = COALESCE(VALUES(formation_id), formation_id)
      `;

      await pool.execute(query, [
        prospectUuid,
        lexpressId,
        sub.email || null,
        sub.prenom || sub.first_name || null,
        sub.nom || sub.last_name || null,
        sub.phone || sub.telephone || null,
        sub.gender || sub.genre || null,
        franceId,
        formationId,
      ]);

      processedCount++;
    } catch (dbError: any) {
      console.error(
        `Erreur SQL pour le prospect ${lexpressId}:`,
        dbError.message,
      );
    }
  }

  return processedCount;
};

export const syncLexpressSubmissionsToDb = async () => {
  const items = await fetchLexpressSubmissions();
  return await processSubmissionsInsertion(items);
};

import { Prospect } from "../models/types";

export const parseTemplateVariables = (
  text: string,
  prospect: Prospect,
): string => {
  if (!text) return "";

  let parsed = text;

  const civility = prospectExpectGender(prospect.gender);

  parsed = parsed.replace(/{{civility}}/g, civility);
  parsed = parsed.replace(/{{first_name}}/g, prospect.first_name || "");
  parsed = parsed.replace(/{{last_name}}/g, prospect.last_name || "");
  parsed = parsed.replace(/{{email}}/g, prospect.email || "");
  parsed = parsed.replace(/{{phone}}/g, prospect.phone || "");
  parsed = parsed.replace(/{{formation}}/g, prospect.formation || "");
  parsed = parsed.replace(
    /{{programme}}/g,
    (prospect as any).programme || prospect.formation || "",
  );

  return parsed;
};

function prospectExpectGender(gender: string) {
  if (!gender) return "";
  const g = gender.toLowerCase().trim();
  if (g === "femme" || g === "féminin") return "Madame";
  if (g === "homme" || g === "masculin") return "Monsieur";
  return "";
}

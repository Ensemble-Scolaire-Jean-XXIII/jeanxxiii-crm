import { pool } from "../config/db";
import { Country } from "../models/types";

export const getAllCountries = async (): Promise<Country[]> => {
  const [rows] = await pool.query("SELECT * FROM countries");
  return rows as Country[];
};

export const getCountryIdByName = async (
  name: string,
): Promise<number | null> => {
  const [rows] = await pool.query(
    "SELECT id FROM countries WHERE name = ? LIMIT 1",
    [name],
  );
  const countries = rows as any[];
  return countries.length > 0 ? countries[0].id : null;
};

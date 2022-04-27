import { Tokens } from "../types/AppTypes";

async function LogInfoToDB(
  tokens: Tokens,
  apiUrl: string,
  entryType: "Preference" | "Info" | "Intermediate solution" | "Final solution",
  data: string,
  info: string
): Promise<boolean> {
  try {
    const res = await fetch(`${apiUrl}/log`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.access}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ entry_type: entryType, data: data, info: info }),
    });

    if (res.status == 201) {
      // successfully added log entry
      console.log(`Log added successfully: ${info} Data: ${data}`);
      return true;
    } else {
      // something went wrong
      console.log(
        `Got return code ${res.status}. Could not add log entry to DB.`
      );
      return false;
    }
  } catch (e) {
    console.log(e);
    // do nothing
    return false;
  }
}

export { LogInfoToDB };

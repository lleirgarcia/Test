export async function GET() {
  try {
    const url =
      "https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?range=10y&interval=1d";

    const res = await fetch(url);
    const json = await res.json();

    return Response.json(json.chart.result[0]);
  } catch (e) {
    return Response.json({ error: "error" }, { status: 500 });
  }
}
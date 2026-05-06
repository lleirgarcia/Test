import { useEffect, useState } from "react";

export default function Name() {
  const [presentData, setPresentData] = useState([]);
  const [predictionData, setPredictionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoverMonth, setHoverMonth] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/externo");
      const json = await res.json();

      const transformed = transform(json);

      setPresentData(transformed.present);
      setPredictionData(transformed.predictions);

      setLoading(false);
    }

    load();
  }, []);

  function transform(apiData) {
    const closes = apiData.indicators.quote[0].close;
    const timestamps = apiData.timestamp;
    const now = new Date();

    let months = {};

    for (let i = 0; i < closes.length; i++) {
      const date = new Date(timestamps[i] * 1000);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const price = closes[i];

      if (!months[key]) {
        months[key] = {
          monthName: date.toLocaleString("es-ES", {
            month: "long",
          }),
          year: date.getFullYear(),
          monthIndex: date.getMonth(),
          open: price,
          last: price,
          date,
        };
      }

      months[key].last = price;
    }

    let real = Object.values(months).map((m) => {
      const pct = ((m.last - m.open) / m.open) * 100;

      const isCurrent =
        m.year === now.getFullYear() && m.monthIndex === now.getMonth();

      return {
        month: `${m.monthName} ${m.year}`,
        monthName: m.monthName,
        year: m.year,
        monthIndex: m.monthIndex,
        returnPct: parseFloat(pct.toFixed(2)),
        direction: pct >= 0 ? "Subida" : "Bajada",
        isCurrent,
        isFuture: false,
        date: m.date,
      };
    });

    const monthStats = {};

    real.forEach((m) => {
      if (!monthStats[m.monthName]) monthStats[m.monthName] = [];
      monthStats[m.monthName].push(m.returnPct);
    });

    const monthAvg = {};

    for (const m in monthStats) {
      monthAvg[m] =
        monthStats[m].reduce((a, b) => a + b, 0) / monthStats[m].length;
    }

    const last6 = real.slice(-6).map((m) => m.returnPct);

    const momentum = last6.reduce((a, b) => a + b, 0) / last6.length;

    const globalTrend = real.reduce((a, b) => a + b.returnPct, 0) / real.length;

    const allMonths = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];

    const yearTarget = 2026;

    const predictions = allMonths.map((mName, index) => {
      const seasonal = monthAvg[mName] ?? 0;

      const base = seasonal * 0.5 + momentum * 0.3 + globalTrend * 0.2;

      const volatility = 1.5;

      return {
        month: `${mName} ${yearTarget}`,
        monthIndex: index,
        prediction: parseFloat(base.toFixed(2)),
        direction: base >= 0 ? "Subida" : "Bajada",
        pessimistic: parseFloat((base - volatility).toFixed(2)),
        optimistic: parseFloat((base + volatility).toFixed(2)),
      };
    });

    const existingKeys = new Set(real.map((m) => `${m.year}-${m.monthIndex}`));

    for (let i = 0; i < 12; i++) {
      const key = `2026-${i}`;

      if (!existingKeys.has(key)) {
        real.push({
          month: `${allMonths[i]} 2026`,
          year: 2026,
          monthIndex: i,
          returnPct: null,
          direction: "-",
          isCurrent: false,
          isFuture: true,
          date: new Date(2026, i, 1),
        });
      }
    }

    return {
      present: real.sort((a, b) => new Date(b.date) - new Date(a.date)),
      predictions: predictions.sort((a, b) => b.monthIndex - a.monthIndex),
    };
  }

  const rowClass = (month) => (hoverMonth === month ? "table-warning" : "");

  return (
    <div className="bg-dark min-vh-100 py-5 text-light">
      <div className="container">
        {loading ? (
          <div className="text-center p-5">Cargando datos...</div>
        ) : (
          <div className="row g-4">
            {/* SITUACIÓN ACTUAL */}
            <div className="col-lg-6">
              <div className="card bg-black border-secondary h-100 shadow-lg rounded-4 overflow-hidden">
                <div className="card-header bg-success p-4 border-0">
                  <h2 className="h5 fw-bold mb-0">Situación Actual</h2>
                </div>

                <div className="card-body p-0">
                  <table
                    className="table table-dark table-hover mb-0 align-middle"
                    style={{ tableLayout: "fixed" }}
                  >
                    <thead>
                      <tr>
                        <th className="ps-4">Mes</th>
                        <th>Resultado</th>
                        <th>% actual</th>
                        <th className="pe-4">Estado</th>
                      </tr>
                    </thead>

                    <tbody>
                      {presentData.map((row, i) => (
                        <tr
                          key={i}
                          className={rowClass(row.month)}
                          onMouseEnter={() => setHoverMonth(row.month)}
                          onMouseLeave={() => setHoverMonth(null)}
                          style={{ height: "45px" }} // 👈 alto fijo
                        >
                          <td className="ps-4 fw-semibold">{row.month}</td>

                          <td>
                            {row.isFuture ? (
                              <span className="badge bg-secondary">-</span>
                            ) : (
                              <span
                                className={`badge px-3 py-2 ${
                                  row.direction === "Subida"
                                    ? "bg-success"
                                    : "bg-danger"
                                }`}
                              >
                                {row.direction}
                              </span>
                            )}
                          </td>

                          <td>
                            {row.returnPct === null ? (
                              <span className="text-secondary">-</span>
                            ) : (
                              <span
                                className={`badge px-3 py-2 ${
                                  row.returnPct >= 0
                                    ? "bg-success"
                                    : "bg-danger"
                                }`}
                              >
                                {row.returnPct}%
                              </span>
                            )}
                          </td>

                          <td className="pe-4">
                            {row.isCurrent ? (
                              <span className="badge bg-warning text-dark">
                                En proceso
                              </span>
                            ) : row.isFuture ? (
                              <span className="badge bg-secondary">Futuro</span>
                            ) : (
                              <span className="badge bg-secondary">
                                Cerrado
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* PREDICCIÓN */}
            <div className="col-lg-6">
              <div className="card bg-black border-secondary h-100 shadow-lg rounded-4 overflow-hidden">
                <div className="card-header bg-primary p-4 border-0">
                  <h2 className="h5 fw-bold mb-0">Predicción Algoritmo</h2>
                </div>

                <div className="card-body p-0">
                  <table
                    className="table table-dark table-hover mb-0 align-middle"
                    style={{ tableLayout: "fixed" }}
                  >
                    <thead>
                      <tr>
                        <th className="ps-4">Mes</th>
                        <th>Resultado</th>
                        <th>Base</th>
                        <th>Rango</th>
                      </tr>
                    </thead>

                    <tbody>
                      {predictionData.map((row, i) => (
                        <tr
                          key={i}
                          className={rowClass(row.month)}
                          onMouseEnter={() => setHoverMonth(row.month)}
                          onMouseLeave={() => setHoverMonth(null)}
                          style={{ height: "45px" }} // 👈 alto fijo
                        >
                          <td className="ps-4 fw-semibold">{row.month}</td>

                          <td>
                            <span
                              className={`badge px-3 py-2 ${
                                row.direction === "Subida"
                                  ? "bg-success"
                                  : "bg-danger"
                              }`}
                            >
                              {row.direction}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`badge px-3 py-2 ${
                                row.prediction >= 0 ? "bg-success" : "bg-danger"
                              }`}
                            >
                              {row.prediction}%
                            </span>
                          </td>

                          <td>
                            {row.pessimistic}% → {row.optimistic}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

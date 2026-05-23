import { useState } from "react";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3001";

function cleanLines(section) {
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^(SUMMARY:|ACTION ITEMS:|OPEN QUESTIONS:)/i.test(line))
    .map((line) => line.replace(/^[-*]\s*/, ""));
}

function parseClaudeText(rawText) {
  if (!rawText || typeof rawText !== "string") {
    return { summary: [], actions: [], questions: [] };
  }

  const actionIndex = rawText.indexOf("ACTION ITEMS:");
  const openIndex = rawText.indexOf("OPEN QUESTIONS:");

  let summaryBlock = rawText;
  let actionBlock = "";
  let openBlock = "";

  if (actionIndex !== -1) {
    summaryBlock = rawText.slice(0, actionIndex);
    if (openIndex !== -1) {
      actionBlock = rawText.slice(actionIndex, openIndex);
      openBlock = rawText.slice(openIndex);
    } else {
      actionBlock = rawText.slice(actionIndex);
    }
  } else if (openIndex !== -1) {
    summaryBlock = rawText.slice(0, openIndex);
    openBlock = rawText.slice(openIndex);
  }

  return {
    summary: cleanLines(summaryBlock),
    actions: cleanLines(actionBlock),
    questions: cleanLines(openBlock),
  };
}

function ActionItem({ item }) {
  const match = item.match(/^([^:]{1,40}):\s*(.+)$/);

  if (!match) {
    return <span>{item}</span>;
  }

  return (
    <span>
      <span className="font-semibold text-slate-100">{match[1]}:</span> {match[2]}
    </span>
  );
}

function App() {
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${apiBase}/api/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to summarize.");
      }

      const data = await response.json();
      const parsed = parseClaudeText(data.summary);
      setResult(parsed);
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTranscript("");
    setResult(null);
    setError("");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100">
      <main className="mx-auto w-full max-w-5xl px-6 py-14 sm:px-8">
        <header className="space-y-4">
          <span className="inline-flex w-fit items-center rounded-full border border-emerald-400/50 bg-emerald-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
            Powered by Claude AI
          </span>
          <h1 className="font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            MeetSumAI
          </h1>
          <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
            Paste any meeting transcript. Get decisions, actions, and clarity — instantly.
          </p>
        </header>

        <section className="mt-10 rounded-2xl border border-slate-800 bg-[#0b1220] p-6">
          <form onSubmit={handleSubmit}>
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Your Meeting Transcript
            </label>
            <textarea
              className="mt-4 h-64 w-full rounded-2xl border border-slate-800 bg-[#111827] p-4 text-sm text-slate-100 shadow-inner outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50"
              placeholder="Paste your transcript here. Even messy, unformatted transcripts work fine."
              rows={10}
              value={transcript}
              onChange={(event) => setTranscript(event.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold transition ${
                loading
                  ? "cursor-not-allowed bg-emerald-300/60 text-emerald-950"
                  : "bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
              }`}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-950/60 border-t-transparent" />
                  Analyzing...
                </>
              ) : (
                "Summarize Meeting →"
              )}
            </button>
            {error ? (
              <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}
          </form>
        </section>

        <section className="mt-8">
          {loading ? (
            <div className="grid gap-4 rounded-2xl border border-slate-800 bg-[#0b1220] p-6 md:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="space-y-3">
                  <div className="h-4 w-24 rounded-full bg-slate-700/60" />
                  <div className="h-3 w-full rounded-full bg-slate-700/40" />
                  <div className="h-3 w-5/6 rounded-full bg-slate-700/40" />
                  <div className="h-3 w-3/4 rounded-full bg-slate-700/40" />
                </div>
              ))}
            </div>
          ) : result ? (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6">
                  <div className="mb-4 flex items-center gap-2 text-emerald-300">
                    <span>📋</span>
                    <h3 className="text-lg font-semibold">Summary</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-slate-200">
                    {result.summary.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-2 h-2 w-2 rounded-full bg-emerald-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6">
                  <div className="mb-4 flex items-center gap-2 text-emerald-300">
                    <span>✅</span>
                    <h3 className="text-lg font-semibold">Action Items</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-slate-200">
                    {result.actions.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-2 h-2 w-2 rounded-full bg-emerald-400" />
                        <ActionItem item={item} />
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-6">
                  <div className="mb-4 flex items-center gap-2 text-emerald-300">
                    <span>❓</span>
                    <h3 className="text-lg font-semibold">Open Questions</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-slate-200">
                    {result.questions.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-2 h-2 w-2 rounded-full bg-emerald-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="w-full rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-6 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/20"
              >
                Summarize Another Meeting
              </button>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default App;

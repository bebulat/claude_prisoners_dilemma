import { useState } from 'react';

const QUESTIONS = [
  {
    key: 'firstRound',
    situation: 'First round',
    description: 'No prior history. What is your opening move?',
  },
  {
    key: 'afterBothConfess',
    situation: 'You both confessed last round',
    description: 'You both betrayed each other. What do you do next?',
  },
  {
    key: 'afterIConfessTheySilent',
    situation: 'You confessed, they stayed silent last round',
    description: 'You betrayed them and they stayed loyal. What do you do next?',
  },
  {
    key: 'afterISilentTheyConfess',
    situation: 'You stayed silent, they confessed last round',
    description: 'They betrayed you and you stayed loyal. What do you do next?',
  },
  {
    key: 'afterBothSilent',
    situation: 'You both stayed silent last round',
    description: 'You both cooperated. What do you do next?',
  },
];

const DEFAULT_STRATEGY = {
  firstRound: null,
  afterBothConfess: null,
  afterIConfessTheySilent: null,
  afterISilentTheyConfess: null,
  afterBothSilent: null,
};

export default function StrategyForm({ onSubmit }) {
  const [strategy, setStrategy] = useState(DEFAULT_STRATEGY);

  const allAnswered = Object.values(strategy).every((v) => v !== null);

  function setAnswer(key, value) {
    setStrategy((s) => ({ ...s, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!allAnswered) return;
    onSubmit(strategy);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {QUESTIONS.map(({ key, situation, description }) => (
        <div key={key} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            {situation}
          </p>
          <p className="text-white mb-4">{description}</p>
          <div className="flex gap-3">
            <ChoiceButton
              label="Confess"
              sublabel="Betray"
              selected={strategy[key] === 'confess'}
              onClick={() => setAnswer(key, 'confess')}
              variant="confess"
            />
            <ChoiceButton
              label="Stay Silent"
              sublabel="Cooperate"
              selected={strategy[key] === 'silent'}
              onClick={() => setAnswer(key, 'silent')}
              variant="silent"
            />
          </div>
        </div>
      ))}

      <button
        type="submit"
        disabled={!allAnswered}
        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl text-lg transition-colors mt-2"
      >
        Lock In Strategy
      </button>
    </form>
  );
}

function ChoiceButton({ label, sublabel, selected, onClick, variant }) {
  const base = 'flex-1 py-3 px-4 rounded-lg border-2 font-semibold transition-all text-center cursor-pointer';
  const styles = {
    confess: selected
      ? 'border-red-500 bg-red-900/40 text-red-300'
      : 'border-slate-600 text-slate-400 hover:border-red-700 hover:text-red-400',
    silent: selected
      ? 'border-emerald-500 bg-emerald-900/40 text-emerald-300'
      : 'border-slate-600 text-slate-400 hover:border-emerald-700 hover:text-emerald-400',
  };

  return (
    <button type="button" onClick={onClick} className={`${base} ${styles[variant]}`}>
      <div>{label}</div>
      <div className="text-xs opacity-70 font-normal mt-0.5">{sublabel}</div>
    </button>
  );
}

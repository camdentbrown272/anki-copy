import { useState } from 'react';
import type { Card } from '../types';
import { Modal } from './Modal';
import { MarkdownContent } from './MarkdownContent';

interface CardEditorModalProps {
  card: Card | null;
  onClose: () => void;
  onSave: (front: string, back: string) => void;
}

export function CardEditorModal({ card, onClose, onSave }: CardEditorModalProps) {
  const [front, setFront] = useState(card?.front ?? '');
  const [back, setBack] = useState(card?.back ?? '');

  return (
    <Modal title={card ? 'Edit card' : 'New card'} onClose={onClose}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Front
          </label>
          <textarea
            autoFocus
            value={front}
            onChange={(e) => setFront(e.target.value)}
            rows={5}
            className="w-full resize-none rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700"
          />
          <div className="mt-2 rounded-lg border border-dashed border-slate-200 p-2 text-sm dark:border-slate-700">
            <MarkdownContent content={front || '*Preview*'} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Back
          </label>
          <textarea
            value={back}
            onChange={(e) => setBack(e.target.value)}
            rows={5}
            className="w-full resize-none rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700"
          />
          <div className="mt-2 rounded-lg border border-dashed border-slate-200 p-2 text-sm dark:border-slate-700">
            <MarkdownContent content={back || '*Preview*'} />
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(front.trim(), back.trim())}
          disabled={!front.trim() || !back.trim()}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </Modal>
  );
}

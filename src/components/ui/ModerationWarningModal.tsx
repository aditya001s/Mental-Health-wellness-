import React from 'react';

export function ModerationWarningModal({
  isOpen,
  violationType,
  onEdit,
  onDiscard,
}: {
  isOpen: boolean;
  violationType: 'abusive' | 'self_harm' | 'sexual' | 'nudity' | null;
  onEdit: () => void;
  onDiscard: () => void;
}) {
  if (!isOpen) return null;

  const getTitle = () => {
    switch (violationType) {
      case 'self_harm':
        return 'Potential self-harm content detected';
      case 'sexual':
        return 'Sexual content detected';
      case 'nudity':
        return 'Nudity detected';
      case 'abusive':
      default:
        return 'Inappropriate language detected';
    }
  };

  const getMessage = () => {
    switch (violationType) {
      case 'self_harm':
        return "We detected language that may indicate self-harm or suicidal intent. If you're feeling unsafe, please consider reaching out to local emergency services or a crisis line.";
      case 'sexual':
        return 'Your message appears to contain sexual content. Please remove explicit language to continue.';
      case 'nudity':
        return 'Your message appears to contain nudity-related content. Please remove explicit language to continue.';
      case 'abusive':
      default:
        return 'Your message appears to contain abusive or harassing language. Please edit it to remove insults or threats to continue the conversation.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 max-w-lg w-full">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{getTitle()}</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{getMessage()}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onEdit} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium">Edit message</button>
          <button onClick={onDiscard} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium">Discard</button>
        </div>
      </div>
    </div>
  );
}

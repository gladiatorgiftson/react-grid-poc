const SHORTCUTS = [
  { keys: 'Tab',           desc: 'Next Cell'     },
  { keys: 'Shift+Tab',     desc: 'Prev Cell'     },
  { keys: 'Ctrl+S',        desc: 'Save Draft'    },
  { keys: 'Delete',        desc: 'Clear Cell'    },
  { keys: 'Esc',           desc: 'Cancel Edit'   },
  { keys: 'Ctrl+Z',        desc: 'Undo'          },
  { keys: 'Ctrl+Shift+Z',  desc: 'Redo'          },
  { keys: 'Ctrl+C',        desc: 'Copy'          },
  { keys: 'Ctrl+V',        desc: 'Paste'         },
  { keys: 'Ctrl+A',        desc: 'Select All'    },
];

export function BottomBar() {
  return (
    <footer className="bottom-bar">
      <span className="bottom-bar__label">Keyboard Shortcuts</span>
      <span className="bottom-bar__sep">|</span>
      {SHORTCUTS.map(({ keys, desc }) => (
        <span key={keys} className="bottom-bar__shortcut">
          <kbd>{keys}</kbd>
          <span>{desc}</span>
        </span>
      ))}
    </footer>
  );
}

const NAV_ITEMS = ['Dashboard', 'My Queue', 'Drafts', 'Returned Items', 'Search / Inquiry', 'Reports'] as const;

interface TopNavProps {
  activeTab?: string;
}

export function TopNav({ activeTab = 'My Queue' }: TopNavProps) {
  return (
    <header className="top-nav">
      <div className="top-nav__brand">
        <span className="top-nav__logo">NIDES</span>
      </div>

      <nav className="top-nav__tabs" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <button
            key={item}
            className={`top-nav__tab ${item === activeTab ? 'top-nav__tab--active' : ''}`}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="top-nav__user">
        <div className="top-nav__avatar" aria-label="User menu">J</div>
        <span className="top-nav__username">Jane Doe</span>
        <span className="top-nav__caret">▾</span>
      </div>
    </header>
  );
}

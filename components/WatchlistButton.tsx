'use client'
import React from 'react';

const WatchlistButton = ({
  symbol,
  company,
  isInWatchlist,
  showTrashIcon,
  type = 'button',
  onWatchlistChange,
}: WatchlistButtonProps) => {
  const [added, setAdded] = React.useState<boolean>(!!isInWatchlist);

  const handleClick = () => {
    const next = !added;
    setAdded(next);
    onWatchlistChange?.(symbol, next);
  };

  if (type === 'icon') {
    return (
      <button
        type="button"
        aria-label={added ? 'Remove from watchlist' : 'Add to watchlist'}
        className={`watchlist-icon-btn ${added ? 'watchlist-icon-added' : 'watchlist-icon'}`}
        onClick={handleClick}
        title={`${added ? 'Remove' : 'Add'} ${company || symbol} ${showTrashIcon ? '' : 'to watchlist'}`}
      >
        {added ? '★' : '☆'}
      </button>
    );
  }

  return (
    <button type="button" className="watchlist-btn" onClick={handleClick}>
      {added ? 'Remove from Watchlist' : 'Add to Watchlist'}
    </button>
  );
};

export default WatchlistButton;

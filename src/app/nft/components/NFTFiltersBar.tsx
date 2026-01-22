/**
 * NFTFiltersBar Component
 * 
 * Filter and search controls for the NFT marketplace.
 * Includes search, sort, view mode toggle, and advanced filters.
 */

import { useState } from 'react';
import { NFTFilters, SortOption } from '../types/nft.types';
import { SORT_OPTIONS, VIEW_MODES } from '../config/nft.config';
import { getTokenPrecision } from '@/config/tokens';
import { SearchInput, Select, TextInput } from '@/components/ui';

// KLV precision for price filters (NFT prices are in KLV)
const KLV_PRECISION = getTokenPrecision('KLV');

interface NFTFiltersBarProps {
  filters: NFTFilters;
  onFiltersChange: (filters: NFTFilters) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  showAdvancedFilters?: boolean;
  collections?: { id: string; name: string }[];
}

export function NFTFiltersBar({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  showAdvancedFilters = true,
  collections = [],
}: NFTFiltersBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchValue });
  };

  const handleSortChange = (sort: SortOption) => {
    onFiltersChange({ ...filters, sort });
  };

  const handleCollectionChange = (collection: string) => {
    onFiltersChange({ 
      ...filters, 
      collection: collection === 'all' ? undefined : collection 
    });
  };

  const clearFilters = () => {
    setSearchValue('');
    onFiltersChange({});
  };

  const hasActiveFilters = filters.search || filters.collection || 
    filters.minPrice !== undefined || filters.maxPrice !== undefined;

  return (
    <div className="mb-6 space-y-4">
      {/* Main Row: Search, Sort, View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <SearchInput
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search NFTs..."
            size="md"
          />
        </form>

        {/* Sort Dropdown */}
        <Select
          value={filters.sort || 'recent'}
          onChange={(e) => handleSortChange(e.target.value as SortOption)}
          options={SORT_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
          size="md"
        />

        {/* Filter Toggle & View Mode */}
        <div className="flex gap-2">
          {showAdvancedFilters && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                h-11 px-4 rounded-xl flex items-center gap-2
                border tr-interactive
                ${showFilters || hasActiveFilters
                  ? 'bg-brand-primary/10 border-border-brand text-brand-primary'
                  : 'bg-overlay-default border-border-default text-text-secondary hover:text-text-primary hover:border-border-active'
                }
              `}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
              <span className="hidden sm:inline text-sm font-medium">Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-brand-primary" />
              )}
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="flex rounded-xl border border-border-default overflow-hidden">
            {VIEW_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => onViewModeChange(mode.id as 'grid' | 'list')}
                className={`
                  h-11 w-11 flex items-center justify-center
                  tr-colors
                  ${viewMode === mode.id
                    ? 'bg-brand-primary text-text-on-brand'
                    : 'bg-overlay-default text-text-secondary hover:text-text-primary'
                  }
                `}
                title={mode.label}
              >
                {mode.id === 'grid' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-bg-surface rounded-2xl border border-border-default p-4 md:p-5 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Collection Filter */}
            <Select
              label="Collection"
              value={filters.collection || 'all'}
              onChange={(e) => handleCollectionChange(e.target.value)}
              size="sm"
            >
              <option value="all">All Collections</option>
              {collections.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </Select>

            {/* Min Price */}
            <TextInput
              label="Min Price (KLV)"
              type="number"
              value={filters.minPrice !== undefined ? String(filters.minPrice / KLV_PRECISION) : ''}
              onChange={(e) => onFiltersChange({
                ...filters,
                minPrice: e.target.value ? parseFloat(e.target.value) * KLV_PRECISION : undefined
              })}
              placeholder="0"
              size="sm"
            />

            {/* Max Price */}
            <TextInput
              label="Max Price (KLV)"
              type="number"
              value={filters.maxPrice !== undefined ? String(filters.maxPrice / KLV_PRECISION) : ''}
              onChange={(e) => onFiltersChange({
                ...filters,
                maxPrice: e.target.value ? parseFloat(e.target.value) * KLV_PRECISION : undefined
              })}
              placeholder="No limit"
              size="sm"
            />

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className={`
                  h-10 px-4 rounded-lg text-sm font-medium
                  tr-colors
                  ${hasActiveFilters
                    ? 'bg-overlay-default text-text-primary hover:bg-overlay-active'
                    : 'bg-overlay-subtle text-text-muted cursor-not-allowed'
                  }
                `}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

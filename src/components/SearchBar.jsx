import React from 'react';

/**
 * Filter, search, and sorting toolbar for the Documents repository page.
 */
export default function SearchBar({
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  sortBy,
  setSortBy,
  documentTypes = []
}) {
  return (
    <div className="card card-premium p-3 mb-4">
      <div className="row g-3 align-items-center">
        {/* Search Input */}
        <div className="col-12 col-md-5">
          <div className="input-group">
            <span className="input-group-text bg-transparent border-end-0 text-muted pe-1">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control form-control-premium border-start-0 ps-2"
              placeholder="Search by file name or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="btn btn-outline-secondary border-0 bg-transparent text-muted"
                type="button" 
                onClick={() => setSearchQuery('')}
                style={{ marginLeft: '-40px', zIndex: 5 }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="d-flex align-items-center">
            <span className="text-nowrap text-muted small me-2 d-none d-lg-inline-block">Type:</span>
            <select
              className="form-select form-select-premium"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Categories</option>
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="col-12 col-sm-6 col-md-4">
          <div className="d-flex align-items-center">
            <span className="text-nowrap text-muted small me-2 d-none d-lg-inline-block">Sort:</span>
            <select
              className="form-select form-select-premium"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest Uploads</option>
              <option value="oldest">Oldest Uploads</option>
              <option value="type">Document Category</option>
              <option value="name">File Alphabetical</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

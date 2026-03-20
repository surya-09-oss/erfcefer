import type { FilterCountry } from "../types/channel";

interface FilterBarProps {
  selectedCountry: FilterCountry;
  onCountryChange: (country: FilterCountry) => void;
  showOnlyLive: boolean;
  onToggleLive: () => void;
}

const COUNTRY_FILTERS: { value: FilterCountry; label: string }[] = [
  { value: "all", label: "All Countries" },
  { value: "IN", label: "India" },
  { value: "US", label: "USA" },
  { value: "GB", label: "UK" },
  { value: "AE", label: "UAE" },
  { value: "AU", label: "Australia" },
  { value: "OTHER", label: "Other" },
];

export default function FilterBar({
  selectedCountry,
  onCountryChange,
  showOnlyLive,
  onToggleLive,
}: FilterBarProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Country Filters */}
        <div className="flex flex-wrap gap-2">
          {COUNTRY_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => onCountryChange(filter.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCountry === filter.value
                  ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Live Toggle */}
        <button
          onClick={onToggleLive}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            showOnlyLive
              ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              showOnlyLive ? "bg-white animate-pulse" : "bg-red-500"
            }`}
          />
          Live Only
        </button>
      </div>
    </div>
  );
}

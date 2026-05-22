import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { DiscoveryFilterSelection, DiscoveryResponse } from "../../shared/contracts";
import { isCitySlug, isExperienceSlug, TravellerService } from "../api/traveller";
import { MuseChartPanel } from "../components/muse/MuseChartPanel";
import { Button } from "../components/ui/Button";
import { CompanionPreviewCard } from "../components/ui/CompanionPreviewCard";
import { FeedbackState } from "../components/ui/FeedbackState";
import { Select } from "../components/ui/Select";
import { SkeletonCard } from "../components/ui/Skeleton";

type LoadState =
  | { status: "loading"; data?: undefined; message?: undefined }
  | { status: "ready"; data: DiscoveryResponse; message?: undefined }
  | { status: "error"; data?: undefined; message: string };

function optionLabel(options: Array<{ value: string; label: string }>, value: string): string {
  return options.find((option) => option.value === value)?.label || value.replace(/-/g, " ");
}

function filtersFromParams(searchParams: URLSearchParams): DiscoveryFilterSelection {
  const city = searchParams.get("city");
  const experience = searchParams.get("experience");
  const availability = searchParams.get("availability");
  const verified = searchParams.get("verified");

  return {
    city: isCitySlug(city) ? city : "all",
    experience: isExperienceSlug(experience) ? experience : "all",
    availability: availability === "available" || availability === "planning_only" ? availability : "any",
    verified: verified === "all" ? "all" : "approved",
  };
}

export function TravellerDiscovery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams]);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const hasMuseTuning = searchParams.get("muse") === "1";

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    TravellerService.getDiscovery(filters)
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Discovery could not be loaded.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const updateFilter = (key: keyof DiscoveryFilterSelection, value: string) => {
    const next = new URLSearchParams(searchParams);
    const defaultValue = key === "city" || key === "experience" ? "all" : key === "availability" ? "any" : "approved";

    if (value === defaultValue) {
      next.delete(key);
    } else {
      next.set(key, value);
    }

    setSearchParams(next, { replace: true });
  };

  const clearMuseTuning = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("muse");
    next.delete("source");
    next.delete("city");
    next.delete("experience");
    setSearchParams(next, { replace: true });
  };

  return (
    <section className="traveller-discovery-page" aria-labelledby="traveller-discovery-title">
      <div className="traveller-discovery-heading">
        <p className="eyebrow">Traveller discovery</p>
        <h1 id="traveller-discovery-title">Find the right fit for the plan.</h1>
        <p>Start with city, mood, and timing. Open a profile when the rhythm feels right.</p>
      </div>

      {state.status === "loading" && (
        <div className="discovery-layout">
          <div className="filter-panel skeleton-filter-panel" aria-hidden="true" />
          <div className="discovery-results-grid">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      )}

      {state.status === "error" && (
        <FeedbackState
          variant="error"
          title="Discovery is unavailable"
          description={state.message}
          actionLabel="Retry"
          onAction={() => setSearchParams(searchParams, { replace: true })}
        />
      )}

      {state.status === "ready" && (
        <div className="discovery-layout">
          <aside className="filter-panel" aria-label="Discovery filters">
            <div className="filter-panel-heading">
              <p className="eyebrow">Tune discovery</p>
              <h2>Filter by city, style, and timing.</h2>
            </div>
            {hasMuseTuning ? (
              <div className="muse-applied-panel" data-testid="muse-discovery-defaults">
                <div>
                  <p className="eyebrow">Muse tuned</p>
                  <p>City and style are prefilled from your private thread.</p>
                </div>
                <button type="button" onClick={clearMuseTuning}>
                  Clear
                </button>
              </div>
            ) : null}
            <MuseChartPanel chart={state.data.chart} compact />
            <Select
              label="City"
              value={state.data.filters.city}
              options={state.data.filterOptions.cities}
              onChange={(event) => updateFilter("city", event.target.value)}
            />
            <Select
              label="Experience"
              value={state.data.filters.experience}
              options={state.data.filterOptions.experiences}
              onChange={(event) => updateFilter("experience", event.target.value)}
            />
            <Select
              label="Availability"
              value={state.data.filters.availability}
              options={state.data.filterOptions.availability}
              onChange={(event) => updateFilter("availability", event.target.value)}
            />
            <Select
              label="Profile status"
              value={state.data.filters.verified}
              options={state.data.filterOptions.verified}
              onChange={(event) => updateFilter("verified", event.target.value)}
            />

            <div className="filter-guidance">
              {state.data.guidance.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </aside>

          <div className="discovery-results">
            <div className="discovery-chip-row" aria-label="Active discovery filters">
              <span>{optionLabel(state.data.filterOptions.cities, state.data.filters.city)}</span>
              <span>{optionLabel(state.data.filterOptions.experiences, state.data.filters.experience)}</span>
              <span>{optionLabel(state.data.filterOptions.availability, state.data.filters.availability)}</span>
              <span>{optionLabel(state.data.filterOptions.verified, state.data.filters.verified)}</span>
            </div>
            {state.data.results.length === 0 ? (
              <FeedbackState
                title={state.data.emptyState.title}
                description={state.data.emptyState.description}
                actionLabel="Clear filters"
                onAction={() => setSearchParams({}, { replace: true })}
              />
            ) : (
              <div className="discovery-results-grid">
                {state.data.results.map((profile) => (
                  <Link key={profile.id} className="discovery-card-link" to={`/traveller/companions/${profile.id}`}>
                    <CompanionPreviewCard profile={profile} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="traveller-flow-footer">
        <p>Unsure what belongs in a first message?</p>
        <Button as={Link} to="/traveller/safety" variant="secondary">Open safety</Button>
      </div>
    </section>
  );
}

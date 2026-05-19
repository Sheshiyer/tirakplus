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

  return (
    <section className="traveller-discovery-page" aria-labelledby="traveller-discovery-title">
      <div className="traveller-discovery-heading">
        <p className="eyebrow">Traveller discovery</p>
        <h1 id="traveller-discovery-title">Browse reviewed profiles by trip context.</h1>
        <p>
          Filter by city, experience, and availability context. Tirak discovery avoids ratings, fake online signals, and instant-booking pressure.
        </p>
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
              label="Review state"
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
        <p>Need a safer reset?</p>
        <Button as={Link} to="/safety" variant="secondary">Review safety guidance</Button>
      </div>
    </section>
  );
}

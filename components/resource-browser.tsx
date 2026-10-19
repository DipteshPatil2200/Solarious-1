"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Search,
} from "lucide-react";
import { resourceCategories } from "@/data/site";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
type Resource = {
  id: number;
  title: string;
  description: string;
  category: string;
  product: string;
  file_name: string;
  file_type: string;
  file_size: number;
  previewImageUrl?: string;
  updated_at: string;
};
function ResourceMedia({ item }: { item: Resource }) {
  const [attempt, setAttempt] = useState(0);
  const preview =
    item.previewImageUrl ||
    (/^image\/(jpeg|png|webp)$/.test(item.file_type || "")
      ? `/api/resources/${item.id}/file`
      : "");
  const src = attempt === 0 ? preview : "";
  if (!src) return <FileText size={26} />;
  return (
    <img
      className="resource-preview"
      src={src}
      alt=""
      loading="lazy"
      onError={() => setAttempt((value) => value + 1)}
    />
  );
}
export default function ResourceBrowser() {
  const [resources, setResources] = useState<Resource[]>([]),
    [loading, setLoading] = useState(true),
    [failed, setFailed] = useState(false),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("all"),
    [product, setProduct] = useState("all");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/resources", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setResources(d.resources ?? []);
        setLoading(false);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setFailed(true);
        setLoading(false);
      });
    return () => controller.abort();
  }, []);
  const products = useMemo(
    () => [...new Set(resources.map((x) => x.product).filter(Boolean))],
    [resources],
  );
  const categories = useMemo(
    () => [
      ...new Set([
        ...resourceCategories,
        ...resources.map((item) => item.category),
      ]),
    ],
    [resources],
  );
  const items = useMemo(
    () =>
      resources.filter(
        (x) =>
          (category === "all" || x.category === category) &&
          (product === "all" || x.product === product) &&
          `${x.title} ${x.description} ${x.category} ${x.product}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [resources, query, category, product],
  );
  if (loading)
    return (
      <div className="admin-loading">
        <Loader2 className="spin" /> Loading approved downloads…
      </div>
    );
  return (
    <div className="resource-browser">
      <div className="resource-controls">
        <label>
          <Search size={17} />
          <input
            aria-label="Search resources"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search downloads"
          />
        </label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="tool-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((x) => (
              <SelectItem key={x} value={x}>
                {x}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {products.length > 0 && (
          <Select value={product} onValueChange={setProduct}>
            <SelectTrigger className="tool-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All products</SelectItem>
              {products.map((x) => (
                <SelectItem key={x} value={x}>
                  {x}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="resource-grid">
        {items.map((x) => (
          <article key={x.id}>
            <ResourceMedia item={x} />
            <span>{x.category}</span>
            <h2>{x.title}</h2>
            <p>{x.description}</p>
            <small>
              {x.file_name} · {(x.file_size / 1024 / 1024).toFixed(1)} MB
              {x.product ? ` · ${x.product}` : ""}
            </small>
            <div className="resource-actions">
              <a
                href={`/api/resources/${x.id}/file`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={15} /> Preview
              </a>
              <a href={`/api/resources/${x.id}/file?download=1`}>
                <Download size={15} /> Download
              </a>
            </div>
          </article>
        ))}
      </div>
      {!items.length && (
        <div className="admin-empty">
          {failed
            ? "Downloads could not be loaded right now. Please refresh the page."
            : "No published resources match your search."}
        </div>
      )}
    </div>
  );
}

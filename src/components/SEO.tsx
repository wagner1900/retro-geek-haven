import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  url: string;
  keywords?: string[];
  image?: string;
  type?: string;
  noIndex?: boolean;
  structuredData?: Record<string, any>;
}

const DEFAULT_IMAGE = "https://lovable.dev/opengraph-image-p98pqg.png";
const SITE_NAME = "BelieveStore";

const getSiteUrl = () => {
  if (typeof window === "undefined") return "";
  return import.meta.env.VITE_SITE_URL || window.location.origin;
};

const updateMetaTag = (
  key: string,
  value: string,
  attribute: "name" | "property" = "name"
) => {
  if (!value) return;
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", value);
};

const updateLinkTag = (rel: string, href?: string) => {
  if (!href) return;
  let link = document.head.querySelector(`link[rel="${rel}"]`);

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", rel);
    document.head.appendChild(link);
  }

  link.setAttribute("href", href);
};

export const SEO = ({
  title,
  description,
  url,
  keywords = [],
  image = DEFAULT_IMAGE,
  type = "website",
  noIndex = false,
  structuredData,
}: SEOProps) => {
  useEffect(() => {
    const siteUrl = getSiteUrl();
    const canonicalUrl = url.startsWith("http") ? url : `${siteUrl}${url}`;

    document.title = title;

    updateMetaTag("description", description);
    updateMetaTag("keywords", keywords.join(", "));
    updateMetaTag("robots", noIndex ? "noindex, nofollow" : "index, follow");

    updateMetaTag("og:title", title, "property");
    updateMetaTag("og:description", description, "property");
    updateMetaTag("og:type", type, "property");
    updateMetaTag("og:url", canonicalUrl, "property");
    updateMetaTag("og:site_name", SITE_NAME, "property");
    updateMetaTag("og:image", image, "property");

    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", title);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", image);
    updateMetaTag("twitter:site", "@believestore");

    updateLinkTag("canonical", canonicalUrl);

    const existingJsonLd = document.head.querySelector(
      "script[data-seo='json-ld']"
    );

    if (structuredData) {
      const script = existingJsonLd || document.createElement("script");
      script.setAttribute("type", "application/ld+json");
      script.setAttribute("data-seo", "json-ld");
      script.textContent = JSON.stringify(structuredData);

      if (!existingJsonLd) {
        document.head.appendChild(script);
      }
    } else if (existingJsonLd) {
      existingJsonLd.remove();
    }
  }, [title, description, url, keywords, image, type, noIndex, structuredData]);

  return null;
};

export default SEO;

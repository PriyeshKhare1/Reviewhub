import { useEffect } from "react";

const BASE_TITLE = "ReviewHub";

/**
 * Sets document.title and optionally the meta description for the current page.
 * @param {string} title - Page-specific title (e.g. "Login", "My Reviews")
 * @param {string} [description] - Optional meta description
 */
export function usePageTitle(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", description);
    }

    return () => {
      document.title = BASE_TITLE;
    };
  }, [title, description]);
}

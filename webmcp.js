/* WebMCP — expose read-only Fenice Holding info to AI agents in the browser.
   Progressive enhancement: no-op where navigator.modelContext is unavailable.
   Spec: https://webmachinelearning.github.io/webmcp/ */
(function () {
  "use strict";

  var mc = typeof navigator !== "undefined" ? navigator.modelContext : null;
  if (!mc || typeof mc.registerTool !== "function") return;

  function text(t) {
    return { content: [{ type: "text", text: t }] };
  }

  var EMPTY_SCHEMA = { type: "object", properties: {}, additionalProperties: false };

  var COMPANIES = [
    {
      name: "Fenice Real Estate Assets",
      tagline: "Asset & Property Management",
      summary:
        "Ownership, enhancement and management of the Fenice Group real estate portfolio. Acquires and optimises income-producing assets in Switzerland, focusing on repositioning and yield improvement through direct entrepreneurial property management."
    },
    {
      name: "Blue Lake Capital",
      tagline: "Financial Advisory",
      summary:
        "Operating company focused on financial services, strategic analysis and optimisation of investments in Swiss real estate. Supports the Group's real estate and financial activities and a select base of longstanding external clients."
    },
    {
      name: "M.A.DI.",
      tagline: "Modular & Deployable Housing",
      summary:
        "Design, construction and assembly of high energy-efficiency modular homes. Delivers customizable prefabricated modules via a flexible turnkey model, optimising timelines, costs and energy performance."
    }
  ];

  var CONTACT = {
    company: "Fenice Holding SA",
    address: "Corso Elvezia 27, 6900 Lugano, Switzerland",
    email: "amministrazione@bluelakecapital.ch",
    website: "https://feniceholding.ch/",
    linkedin: "https://www.linkedin.com/company/fenice-holding-sa"
  };

  var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  var opts = controller ? { signal: controller.signal } : undefined;

  function register(def) {
    try {
      if (opts) mc.registerTool(def, opts);
      else mc.registerTool(def);
    } catch (e) {}
  }

  register({
    name: "get_company_overview",
    description:
      "Get an overview of Fenice Holding SA, a Swiss real estate investment holding based in Lugano.",
    inputSchema: EMPTY_SCHEMA,
    execute: function () {
      return text(
        "Fenice Holding SA coordinates an investment group active across Switzerland, focused on " +
          "enhancing real estate assets through direct entrepreneurial management and strategic financial " +
          "structuring. Core themes: retrofitting, financial engineering, modular innovation, asset management, " +
          "sustainability. Leadership: Federico Cappelletti (Chairman), Sebastiano Andreoli (CEO). " +
          "Based in Lugano, Switzerland. Group companies: Fenice Real Estate Assets, Blue Lake Capital, M.A.DI."
      );
    }
  });

  register({
    name: "list_group_companies",
    description:
      "List the operating companies of the Fenice Group with a short description of each.",
    inputSchema: EMPTY_SCHEMA,
    execute: function () {
      var lines = COMPANIES.map(function (c) {
        return "• " + c.name + " (" + c.tagline + "): " + c.summary;
      });
      return text(lines.join("\n\n"));
    }
  });

  register({
    name: "get_contact_info",
    description:
      "Get contact and location details for Fenice Holding SA (address, email, website, LinkedIn).",
    inputSchema: EMPTY_SCHEMA,
    execute: function () {
      return text(
        CONTACT.company +
          "\nAddress: " + CONTACT.address +
          "\nEmail: " + CONTACT.email +
          "\nWebsite: " + CONTACT.website +
          "\nLinkedIn: " + CONTACT.linkedin
      );
    }
  });
})();

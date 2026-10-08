export type TeamKitSet = {
  local?: string;
  visitante?: string;
  alternativa?: string;
  cuarta?: string;
};

export type Team = {
  name: string;
  slug: string;
  stadium: string;
  crest: string | null;
  stadiumImage: string | null;
  kits: {
    field: TeamKitSet;
    goalkeeper: TeamKitSet;
  };
};

export const teams: Team[] = [
  {
    "name": "ATHLETIC CLUB",
    "slug": "athletic-club",
    "stadium": "Estadio San Mamés",
    "crest": "/clubs/athletic-club.png",
    "stadiumImage": "/stadiums/athletic-club.jpg",
    "kits": {
      "field": {
        "local": "/kits/athletic-club/local.jpg",
        "visitante": "/kits/athletic-club/visitante.png",
        "alternativa": "/kits/athletic-club/alternativa.png"
      },
      "goalkeeper": {
        "local": "/kits/athletic-club/portero-local.png",
        "visitante": "/kits/athletic-club/portero-visitante.png"
      }
    }
  },
  {
    "name": "ATLÉTICO DE MADRID",
    "slug": "atletico-de-madrid",
    "stadium": "Riyadh Air Metropolitano",
    "crest": "/clubs/atletico-de-madrid.png",
    "stadiumImage": "/stadiums/atletico-de-madrid.jpg",
    "kits": {
      "field": {
        "local": "/kits/atletico-de-madrid/local.jpg",
        "visitante": "/kits/atletico-de-madrid/visitante.png",
        "alternativa": "/kits/atletico-de-madrid/alternativa.png"
      },
      "goalkeeper": {}
    }
  },
  {
    "name": "CA OSASUNA",
    "slug": "ca-osasuna",
    "stadium": "Estadio El Sadar",
    "crest": "/clubs/ca-osasuna.png",
    "stadiumImage": "/stadiums/ca-osasuna.jpg",
    "kits": {
      "field": {
        "local": "/kits/ca-osasuna/local.jpg",
        "visitante": "/kits/ca-osasuna/visitante.png",
        "alternativa": "/kits/ca-osasuna/alternativa.png"
      },
      "goalkeeper": {}
    }
  },
  {
    "name": "CELTA",
    "slug": "celta",
    "stadium": "Estadio ABANCA Balaídos",
    "crest": "/clubs/celta.png",
    "stadiumImage": "/stadiums/celta.jpg",
    "kits": {
      "field": {
        "local": "/kits/celta/local.png",
        "visitante": "/kits/celta/visitante.png",
        "alternativa": "/kits/celta/alternativa.png"
      },
      "goalkeeper": {
        "local": "/kits/celta/portero-local.png",
        "visitante": "/kits/celta/portero-visitante.png",
        "alternativa": "/kits/celta/portero-alternativa.png",
        "cuarta": "/kits/celta/portero-cuarta.png"
      }
    }
  },
  {
    "name": "DEPORTIVO ALAVÉS",
    "slug": "deportivo-alaves",
    "stadium": "Mendizorroza",
    "crest": "/clubs/deportivo-alaves.png",
    "stadiumImage": "/stadiums/deportivo-alaves.jpg",
    "kits": {
      "field": {
        "local": "/kits/deportivo-alaves/local.png",
        "visitante": "/kits/deportivo-alaves/visitante.png",
        "alternativa": "/kits/deportivo-alaves/alternativa.png"
      },
      "goalkeeper": {}
    }
  },
  {
    "name": "ELCHE CF",
    "slug": "elche-cf",
    "stadium": "Estadio Martínez Valero",
    "crest": "/clubs/elche-cf.png",
    "stadiumImage": "/stadiums/elche-cf.jpg",
    "kits": {
      "field": {
        "local": "/kits/elche-cf/local.png",
        "visitante": "/kits/elche-cf/visitante.png",
        "alternativa": "/kits/elche-cf/alternativa.png"
      },
      "goalkeeper": {}
    }
  },
  {
    "name": "FC BARCELONA",
    "slug": "fc-barcelona",
    "stadium": "Spotify Camp Nou",
    "crest": "/clubs/fc-barcelona.png",
    "stadiumImage": "/stadiums/fc-barcelona.jpg",
    "kits": {
      "field": {
        "local": "/kits/fc-barcelona/local.png",
        "visitante": "/kits/fc-barcelona/visitante.png",
        "alternativa": "/kits/fc-barcelona/alternativa.png"
      },
      "goalkeeper": {
        "local": "/kits/fc-barcelona/portero-local.jpg",
        "visitante": "/kits/fc-barcelona/portero-visitante.png"
      }
    }
  },
  {
    "name": "GETAFE CF",
    "slug": "getafe-cf",
    "stadium": "Coliseum",
    "crest": "/clubs/getafe-cf.png",
    "stadiumImage": "/stadiums/getafe-cf.jpg",
    "kits": {
      "field": {
        "local": "/kits/getafe-cf/local.png",
        "visitante": "/kits/getafe-cf/visitante.png",
        "alternativa": "/kits/getafe-cf/alternativa.png"
      },
      "goalkeeper": {}
    }
  },
  {
    "name": "LEVANTE UD",
    "slug": "levante-ud",
    "stadium": "Estadio Ciutat de València",
    "crest": "/clubs/levante-ud.png",
    "stadiumImage": "/stadiums/levante-ud.jpg",
    "kits": {
      "field": {
        "local": "/kits/levante-ud/local.jpg",
        "visitante": "/kits/levante-ud/visitante.png",
        "alternativa": "/kits/levante-ud/alternativa.png"
      },
      "goalkeeper": {}
    }
  },
  {
    "name": "MÁLAGA CF",
    "slug": "malaga-cf",
    "stadium": "La Rosaleda",
    "crest": "/clubs/malaga-cf.png",
    "stadiumImage": "/stadiums/malaga-cf.jpg",
    "kits": {
      "field": {
        "local": "/kits/malaga-cf/local.jpg",
        "visitante": "/kits/malaga-cf/visitante.png",
        "alternativa": "/kits/malaga-cf/alternativa.png"
      },
      "goalkeeper": {}
    }
  },
  {
    "name": "R. RACING CLUB",
    "slug": "r-racing-club",
    "stadium": "El Sardinero",
    "crest": "/clubs/r-racing-club.png",
    "stadiumImage": "/stadiums/r-racing-club.jpg",
    "kits": {
      "field": {
        "local": "/kits/r-racing-club/local.png",
        "visitante": "/kits/r-racing-club/visitante.png",
        "alternativa": "/kits/r-racing-club/alternativa.png"
      },
      "goalkeeper": {
        "local": "/kits/r-racing-club/portero-local.png",
        "visitante": "/kits/r-racing-club/portero-visitante.png",
        "alternativa": "/kits/r-racing-club/portero-alternativa.png"
      }
    }
  },
  {
    "name": "RAYO VALLECANO",
    "slug": "rayo-vallecano",
    "stadium": "Estadio de Vallecas",
    "crest": "/clubs/rayo-vallecano.png",
    "stadiumImage": "/stadiums/rayo-vallecano.jpg",
    "kits": {
      "field": {
        "local": "/kits/rayo-vallecano/local.jpg",
        "visitante": "/kits/rayo-vallecano/visitante.jpg",
        "alternativa": "/kits/rayo-vallecano/alternativa.jpg"
      },
      "goalkeeper": {}
    }
  },
  {
    "name": "RC DEPORTIVO",
    "slug": "rc-deportivo",
    "stadium": "Estadio ABANCA-RIAZOR",
    "crest": "/clubs/rc-deportivo.png",
    "stadiumImage": "/stadiums/rc-deportivo.jpg",
    "kits": {
      "field": {
        "local": "/kits/rc-deportivo/local.jpg",
        "visitante": "/kits/rc-deportivo/visitante.png",
        "alternativa": "/kits/rc-deportivo/alternativa.png"
      },
      "goalkeeper": {
        "local": "/kits/rc-deportivo/portero-local.png",
        "visitante": "/kits/rc-deportivo/portero-visitante.png"
      }
    }
  },
  {
    "name": "RCD ESPANYOL DE BARCELONA",
    "slug": "rcd-espanyol-de-barcelona",
    "stadium": "RCDE Stadium",
    "crest": "/clubs/rcd-espanyol-de-barcelona.png",
    "stadiumImage": "/stadiums/rcd-espanyol-de-barcelona.jpg",
    "kits": {
      "field": {
        "local": "/kits/rcd-espanyol-de-barcelona/local.png",
        "visitante": "/kits/rcd-espanyol-de-barcelona/visitante.png",
        "alternativa": "/kits/rcd-espanyol-de-barcelona/alternativa.png"
      },
      "goalkeeper": {
        "local": "/kits/rcd-espanyol-de-barcelona/portero-local.png",
        "visitante": "/kits/rcd-espanyol-de-barcelona/portero-visitante.png",
        "alternativa": "/kits/rcd-espanyol-de-barcelona/portero-alternativa.png"
      }
    }
  },
  {
    "name": "REAL BETIS",
    "slug": "real-betis",
    "stadium": "Estadio La Cartuja",
    "crest": "/clubs/real-betis.png",
    "stadiumImage": "/stadiums/real-betis.jpg",
    "kits": {
      "field": {
        "local": "/kits/real-betis/local.png",
        "visitante": "/kits/real-betis/visitante.png",
        "alternativa": "/kits/real-betis/alternativa.png"
      },
      "goalkeeper": {}
    }
  },
  {
    "name": "REAL MADRID",
    "slug": "real-madrid",
    "stadium": "Bernabéu",
    "crest": "/clubs/real-madrid.png",
    "stadiumImage": "/stadiums/real-madrid.jpg",
    "kits": {
      "field": {
        "local": "/kits/real-madrid/local.png",
        "visitante": "/kits/real-madrid/visitante.png",
        "alternativa": "/kits/real-madrid/alternativa.png"
      },
      "goalkeeper": {
        "local": "/kits/real-madrid/portero-local.png",
        "visitante": "/kits/real-madrid/portero-visitante.png"
      }
    }
  },
  {
    "name": "REAL SOCIEDAD",
    "slug": "real-sociedad",
    "stadium": "Anoeta",
    "crest": "/clubs/real-sociedad.png",
    "stadiumImage": "/stadiums/real-sociedad.jpg",
    "kits": {
      "field": {
        "local": "/kits/real-sociedad/local.png",
        "visitante": "/kits/real-sociedad/visitante.png",
        "alternativa": "/kits/real-sociedad/alternativa.png"
      },
      "goalkeeper": {
        "local": "/kits/real-sociedad/portero-local.png",
        "visitante": "/kits/real-sociedad/portero-visitante.png"
      }
    }
  },
  {
    "name": "SEVILLA FC",
    "slug": "sevilla-fc",
    "stadium": "Ramón Sánchez Pizjuán",
    "crest": "/clubs/sevilla-fc.png",
    "stadiumImage": "/stadiums/sevilla-fc.jpg",
    "kits": {
      "field": {
        "local": "/kits/sevilla-fc/local.png",
        "visitante": "/kits/sevilla-fc/visitante.png",
        "alternativa": "/kits/sevilla-fc/alternativa.png"
      },
      "goalkeeper": {
        "local": "/kits/sevilla-fc/portero-local.png",
        "visitante": "/kits/sevilla-fc/portero-visitante.png"
      }
    }
  },
  {
    "name": "VALENCIA CF",
    "slug": "valencia-cf",
    "stadium": "Camp de Mestalla",
    "crest": "/clubs/valencia-cf.png",
    "stadiumImage": "/stadiums/valencia-cf.jpg",
    "kits": {
      "field": {
        "local": "/kits/valencia-cf/local.png",
        "visitante": "/kits/valencia-cf/visitante.png",
        "alternativa": "/kits/valencia-cf/alternativa.png"
      },
      "goalkeeper": {
        "local": "/kits/valencia-cf/portero-local.png",
        "visitante": "/kits/valencia-cf/portero-visitante.png",
        "alternativa": "/kits/valencia-cf/portero-alternativa.png",
        "cuarta": "/kits/valencia-cf/portero-cuarta.png"
      }
    }
  },
  {
    "name": "VILLARREAL CF",
    "slug": "villarreal-cf",
    "stadium": "Estadio de la Cerámica",
    "crest": "/clubs/villarreal-cf.png",
    "stadiumImage": "/stadiums/villarreal-cf.jpg",
    "kits": {
      "field": {
        "local": "/kits/villarreal-cf/local.png",
        "visitante": "/kits/villarreal-cf/visitante.jpg",
        "alternativa": "/kits/villarreal-cf/alternativa.png"
      },
      "goalkeeper": {}
    }
  }
];

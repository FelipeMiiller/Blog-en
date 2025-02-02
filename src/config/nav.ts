import { MainNavType } from "@/types"

interface MainNavConfigType extends MainNavType {
  hrefs: {
    blog: {
      post: string
      tags: string
      index: string
    }
  }
}

export const mainNavConfig: MainNavConfigType = {
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Blog",
      href: "/blog",
    },
    {
      title: "About",
      href: "/about",
    },
  ],
  hrefs: {
    blog: {
      post: "/blog/post/",
      tags: "/blog/tags/",
      index: "/blog/",
    },
  },
}

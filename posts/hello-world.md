---
title: Hello World
date: 2025-12-26
tags: [intro, mvp]
---

# Hello, World

This is the first post for the **minimal static blog MVP**.

## What works in S1

- Static layout (sidebar + content)
- Post registry via `posts/index.json`
- Markdown rendering via **marked.js**

> Tip: Run a local server to avoid CORS issues:
>
> ```bash
> python3 -m http.server 8000
> ```

## Code block

```js
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet('blog'));
```

## Links

- Back to the homepage: [Home](index.html)

---

End of post.

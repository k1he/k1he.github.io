---
title: Rich Content Test
date: 2025-12-27
tags: [demo, code, math, mermaid, images]
---

# Testing Rich Content

This post tests **Prism.js** code highlighting, **KaTeX** math rendering, **Mermaid** diagrams, and **image zoom**.

## Code Highlighting

Here is some Python code:

```python
def fib(n):
    a, b = 0, 1
    while a < n:
        print(a, end=' ')
        a, b = b, a+b
    print()

fib(1000)
```

And some JavaScript:

```javascript
const greet = (name) => {
  console.log(`Hello, ${name}!`);
};

greet("World");
```

## Math Formulas

Inline math looks like this: $E = mc^2$.

Block math should be centered:

$$
f(x) = \int_{-\infty}^\infty \hat f(\xi)\,e^{2\pi i \xi x} \,d\xi
$$

Matrices:

$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
$$

## Mermaid Diagrams

A simple flowchart:

```mermaid
flowchart TD
  A[Write Markdown] --> B{Has mermaid blocks?}
  B -- Yes --> C[Load mermaid.min.js lazily]
  B -- No --> D[Skip loading]
  C --> E[Render diagram]
```

A sequence diagram:

```mermaid
sequenceDiagram
  participant U as User
  participant B as Browser
  participant S as Static Files

  U->>B: Open post.html?slug=test-rich-content
  B->>S: Fetch posts/test-rich-content.md
  S-->>B: Markdown
  B->>B: marked.parse + initRichContent
  B->>B: Render Mermaid + enable image zoom
```

## Images (Click to Zoom)

Click the image to zoom (powered by medium-zoom):

![Blog logo](assets/logo.svg)

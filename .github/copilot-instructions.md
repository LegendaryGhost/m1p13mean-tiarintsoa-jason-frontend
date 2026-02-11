
You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.
- Do not write arrow functions in templates (they are not supported).

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## UI guidelines

- Our main library for UI components is PrimeNG
- Use Prime Icons for icons, do not use any other icon library or emojis
- You can find the documentation here: https://primeng.org/llms/llms.txt

### Color Theme

This application uses a professional, modern color palette optimized for mall management:

**Primary Colors:**
- Primary Blue: `#1976D2` - Main brand color, used for primary actions and navigation
- Primary Dark: `#1565C0` - Hover states and emphasis
- Primary Light: `#BBDEFB` - Backgrounds and subtle highlights

**Secondary Colors:**
- Secondary Orange: `#FF6F00` - Call-to-action buttons, important alerts
- Secondary Dark: `#E65100` - Hover states
- Secondary Light: `#FFE0B2` - Backgrounds

**Accent Colors:**
- Accent Teal: `#00ACC1` - Interactive elements, links
- Accent Dark: `#00838F` - Hover states
- Accent Light: `#B2EBF2` - Highlights

**Semantic Colors:**
- Success: `#4CAF50` - Success messages, confirmations
- Error: `#F44336` - Error messages, destructive actions
- Warning: `#FF9800` - Warning messages, caution
- Info: `#2196F3` - Informational messages

**Neutral Colors:**
- Background Primary: `#FFFFFF` - Main background
- Background Secondary: `#F5F7FA` - Alternative background
- Background Tertiary: `#E8EBF0` - Dividers, borders
- Text Primary: `#212121` - Main text (contrast ratio 15.8:1)
- Text Secondary: `#616161` - Secondary text (contrast ratio 7.3:1)
- Text Disabled: `#9E9E9E` - Disabled text
- Border: `#E0E0E0` - Borders and dividers

**Accessibility:**
- All color combinations meet WCAG AA standards (minimum 4.5:1 for normal text, 3:1 for large text)
- Use semantic colors consistently across the application
- Ensure sufficient contrast for all interactive elements

### Typography

This application uses **Inter** as the primary font family:

**Font Family:**
- Primary: `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`
- Monospace: `'JetBrains Mono', 'Fira Code', 'Consolas', monospace` (for code snippets)

**Font Weights:**
- Regular: 400 - Body text, paragraphs
- Medium: 500 - Labels, form fields, secondary headings
- Semi-Bold: 600 - Primary headings, emphasis
- Bold: 700 - Important headings, calls-to-action

**Font Sizes:**
- Base: 16px (1rem)
- Small: 14px (0.875rem) - Secondary text, captions
- Large: 18px (1.125rem) - Emphasis text
- H1: 32px (2rem), weight 600-700
- H2: 24px (1.5rem), weight 600
- H3: 20px (1.25rem), weight 600
- H4: 18px (1.125rem), weight 500-600

**Line Heights:**
- Headings: 1.2
- Body text: 1.5
- Compact elements (buttons, inputs): 1.4

**Best Practices:**
- Use Inter for all UI elements for consistency
- Ensure text remains readable at all sizes
- Maintain proper font weight hierarchy
- Inter is optimized for screen readability and provides excellent legibility

## Project description

This project is a web application built to manage the slots and location of a mall. It includes an interactive map for the visitors to easily find their way around the mall, product and slot location management for the sellers, and a dashboard for the mall administrators to manage the slots and location information. The application is built using Angular for the frontend and Node.js for the backend, with a MongoDB database to store the data. The application is designed to be user-friendly, responsive, and accessible, following best practices in web development.
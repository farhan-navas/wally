# Wally

Wally is a relationship‑wellness companion designed to strengthen offline communication skills through tailored prompts, reflective exercises, and empathetic guidance. It adopts a Singlish‑flavored English style to make interactions feel natural and engaging for its users. Currently Wally is finetuned to provide responses tailored to English (Singlish) & Chinese speakers.

## Why use Wally?

Wally helps couples, friends, or colleagues engage in meaningful offline conversations by providing generated prompts, recommendations, and reflective questions. Its therapist‑style guidance is backed by a fine‑tuned language model that offers supportive feedback without judgment. Users can track their chat history, customize the app’s tone (including Singlish options), and upload relevant media for context. Streamlined with a modern React/Next.js frontend and AI pipeline, Wally is designed for both simplicity and depth in fostering better communication.

## Tech Stack

- **Framework & Language**

  - Next.js (App Router)
  - React
  - TypeScript

- **Styling & UI**

  - Tailwind CSS
  - Radix UI (headless components)
  - Shadcn/ui (component library)

- **Authentication & Sessions**

  - Clerk (with Prisma adapter)

- **State Management**

  - Jotai (atomic state)

- **Data Fetching & API**

  - tRPC (type‑safe RPC)
  - @tanstack/react-query

- **AI Orchestration**

  - OpenAI API (fine‑tuned models)
  - Deepseek API

- **Database**

  - PostgreSQL (provisioned by Neon)
  - Prisma ORM (schema, migrations, seeding)

- **Retrieval & Embeddings**

  - Pinecone (vector search / RAG)
  - Milvus

- **File Uploads & Media**

  - Uploadthing (images & PDF uploads)
  - Custom upload/display/delete components

- **Validation & Utilities**

  - Zod (schema validation)

- **Observability & Payments**

  - Highlight.io (error logging)
  - Stripe (payment plans & processing)

## TO-DO LIST

<details>
  <summary><strong>Front-End</strong></summary>

- [x] create home/chat/login pages
- [x] personify home page (can be improved) - more relatable ui
- [x] fix chat page ui
- [x] update sidebar ui, completely hidden
- [x] personify sidebar ui + classify by relationship maybe(?) (CAN be improved)
- [x] create plans page
- [x] create popup ui to be used throughout site for errors/successes etc..
- [x] create update profile dialog box component
- [x] create one form component to be used across create-profile and update-profile
- [x] map each message from openai/user message to a chatmessage component, and improve scrollbox
- [x] add image/pdf upload functionality (currently from device)
  - [x] display file selected (if image) on frontend
  - [ ] display file selected in dropzone
  - [ ] figure out delete file flow on frontend
  - [ ] add image/pdf upload functionality (from drive/dropbox etc.)
- [x] update frontEnd to show 3 different dropdowns for responses
- [ ] display currently selected emotion on frontend
- [ ] updateProfile display (birthdate and heartLevel does not render default value)
- [x] link user sessionStorage to jotai state (previously using localStorage)

</details>

<details>
  <summary><strong>UI/UX</strong></summary>

- [ ] make sure ui for all pages is exactly 100vh (on all devices!)
- [ ] fix create-chat page ui (languages currently greyed out)
- [ ] make sure scroll area in chat page sticks to the bottom
- [ ] chat area has a down button to scroll down
- [ ] fix scrollRef, make sure page scrolls down all the way when messageStreams render
- [ ] make entire ui mobile friendly

</details>

<details>
  <summary><strong>DB</strong></summary>

- [x] create schema for necessary wally components
- [x] update schema to hold messages array + correct message
- [x] update schema to hold file[]
- [x] create file model for OpenAI Attachments
- [x] save multiple messages to allMessages

</details>

<details>
  <summary><strong>Auth + tRPC</strong></summary>

- [x] fix login page ui (just styling)
- [x] correct client side auth errors (import session from clerk not next-auth)
- [x] remove user id input from all routes use id from ctx.session
- [x] seed current users into vercel db
- [x] user with no plan is rerouted to "/plans" page when navigating to '/create-chat'
- [x] update clerk webhooks to send data to vercel db (for production do manually depending on external account)
- [x] procedure to update chats's updatedAt (arrange chats by updatedAt, not createdAt)
- [x] save message to db (including files, optional)
- [x] procedure to add allMessages array to db, use current message route for correct message only
- [ ] convert all restricted value fields to enums
- [ ] update config.ts/index.ts and src/api/auth (not for demo, read up!)
- [ ] convert to personal providers for auth, before launch
- [ ] rate limits to each user on number of api calls (per month/day..)
- [ ] use httpbatchstreamlink to stream trpc calls

</details>

<details>
  <summary><strong>Profile</strong></summary>

- [x] customised user settings page (optional)
- [x] chat/profile configuration button and popup
- [x] route to new chat page when profile is created
- [x] create updateProfile route, only updates necessary info
- [x] delete chat functionality + add to frontend

</details>

<details>
  <summary><strong>Homepage + Chat Headers</strong></summary>

- [x] test chatHeaders routes
- [x] figure out best routing conventions
- [x] route createChat to new page with the chat once complete
- [x] create chat scrollbox

</details>

<details>
  <summary><strong>OpenAI API (text-to-text)</strong></summary>

- [x] system prompt optimization (can still be improved)
- [x] write sendMessage route
- [x] test sendMessage call to openAI and check response
- [x] stream ai responses
- [x] queries messages are added to the Messages object to send to OpenAI
- [x] add function to stop request, and retry on error
- [x] structure response object so that we can personalize output
- [x] able to send image/pdf upload capabilities
- [ ] implement RAG (data flow issues) + Pinecone
- [ ] indiv pinecone namespace for each user -> id prefixes for each profile
- [x] return multiple responses to user before beta release
- [ ] add error handling, cancelling & regeneration to UI using vercel SDK
- [x] optimize speed and payload size
- [ ] add context window library and tokenizer, figure out embedding

</details>

### OPTIMIZATION

- [ ] set up analytic + error management (w/ highlight or launchdarkly - in the future)

  - [ ] highlight.io integration in vercel (paid integration - w vercel pro)
  - [x] highlight.io integration in github
  - [x] add highlight identify user session
  - [ ] add specific background traces for particular routes, eg: api call to openai, exclude http overhead
  - [ ] learn to use highlight efficiently and automate issues for errors

- [ ] optimize "use client" boundaries for less CSR
- [ ] optimization testing (w/ react-scan)

  - [ ] extract out entire chat-home.tsx (and similar pages) to reduce csr
  - [ ] improve page load times
  - [ ] add interactivity to page (make use of suspense boundaries/loading.tsx)
  - [ ] minimize rerenders
  - [ ] use different types of queries
  - [ ] try using abort controller

- [x] integrate global state management - jotai (atomic state)

  - [x] store all chatHeader data (everyth except messages)
  - [x] use atomic state for chatHome page
  - [x] sort (according to updatedAt) before displaying chatData on frontend
  - [x] useEffect in app sidebar handles all:
    - [x] update profile -> updates focusedChatData atom (useEffect in app-sidebar)
    - [x] delete profile -> removes ref to focusedChatData atom
    - [x] user sends message -> update updatedAt of focusedChatData atom

- [x] separate dbs for production and dev
- [ ] check auth caching state
- [ ] error logging (w/ axiom - paid)
- [ ] routing pages (parallel routes)
- [ ] language option (expand wally ai to be able to give answers in different languages)

### POST-PRODUCTION

- [ ] payment processing + webhooks (w/ stripe)
- [ ] update user schema (paid vs free user)
- [ ] migrate from pinecone db to milvus once we start to scale
- [ ] migrate from vercel hosting to ...

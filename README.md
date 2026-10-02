# Project-02-Final-MVP
polished version of web project
What is this?

Page Trail: A personal book log You search for a book (or add one manually), put it on a bookshelf– Want to read, Reading, or Read– and give it a star rating once you're finished. You can search and sort through your own shelves by title, author, or genre, and there's a Stats tab that displays books you've read in the current year, your average rating, and total pages read.

Why does it exist?

Traditional book trackers are all about feeds, followers, and leaderboards. I needed something more straightforward: a nice, quiet, no-ad, no-subscriber-accounts-to-sign-up-for space to note what I'm reading and not have it become yet another social network. Anything you add is stored on your own browser's storage, the only thing leaving your machine is the text of a book search which goes to Google Books.

What tools did I use?

- HTML, CSS and JavaScript (no framework): I wanted to learn the basics, a shelf-and-card app doesn't require anything more.
- localStorage: Stores your books in the browser, there is no server, no account, and no database to set up.
- Google Books API - It provides covers, authors, page numbers, genres (via a search query) so I'm not typing all that in!
– Google Fonts (Source Serif 4 and IBM Plex Sans): The site feels like a library because of a serif used in the book titles. A neat sans-serif makes controls easily readable.
- - VS Code and Git/GitHub (for editing and version control).
- Github pages: Free hosting right out of the repository.
- Claude (AI assistant): I used it for summarizing my P01 code, refactoring the P02 files and generating documentation which I then edited. [Add Figma here if you used it.]

How to access it

Live site: [PASTE YOUR GITHUB PAGES URL HERE]

Repository: [PASTE YOUR REPO URL HERE]

What you have stored in your books is saved in the browser you are using. They will not be available in other browsers.

What was different between Project 01 and Project 02?

Kept

- Manual add, 3 shelves, move between shelves, 1-5 stars for finished books, localStorage saving- books saved in P01 still load.

Improved

- Shelf redesign. P01 was workable but felt like a spreadsheet and a plain book list. P02 has cover card shelves, teal-and-plum header, a color for each shelf, serif book titles, and designed placeholder covers for non-image books.
- In P01, right column was narrow. In P02, grid adapts across phone/tablet/desktop, with larger targets, visible keyboard focus.
- Safer rendering. Book titles are included as the non-HTML text, not HTML.
- For the footer copy. It now states honestly that searches for books are sent to Google Books.

Added

Google Books search with covers, authors, page counts, and genres. Manual entry of books.
- Search and genre filters for your own shelves.
- Stats tab: books read this year, your average rating, total pages and total books.
- Remove confirmation so that a book can't be deleted accidentally.

Not included

- Similar-book recommendations. This was the "if time permits" feature in my iteration plan. I opted for a solid core that was complete, rather than a feature that was half finished at launch.

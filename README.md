# A page issues inventory

## What does this do?

This script uses the mediawiki API to produce a list of parsed templates that can be considered "page issues" or "article notices".

## Why does it do it?

The purpose of this list is to count how many page issues, in which languages, can be made more compact for mobile devices.

## How does it work?

The script fetch templates that are members of a specific category. The category is assumed to hold most or many of the  "page issues" templates for a given language*.

The templates from the "page issues" category are then formatted as wikitext and sent back to the API to be parsed into HTML. The final HTML is formatted in a table on a per-language basis.

\* **DISCLAIMER**: This approach only works if the language in question has a category page that lists "page issues". Some Wikis don't have a broad "page issues" category page. ¯\\\_(ツ)\_/¯

## How do I use it?

```
npm install
npm run start
```
The script only outputs one langauge at a time. To change the output language, you have to go into `index.js` and modify the value of `currentLang` to match a property in `langmap`.

## Who dun did it?
Written by [JDrewniak (WMF)](https://meta.wikimedia.org/wiki/User:JDrewniak_(WMF)) for the Reading Web Team in service of task [T189132](https://phabricator.wikimedia.org/T189132).

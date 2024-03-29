# The Archipelago Map

Gareth Dennis streams an [#AnEngineerPlays Transport Fever 2 series](https://www.youtube.com/watch?v=uX9Ru2Yl-bQ&list=PLlPJmKp10F4pybo0cEItnjAxmCt4Lc2dp) on YouTube.

He made a map for it, which is available as a PDF. This is a web-based viewer for that map.

To be clear, the map is all his; I just made the web viewer. The RailNatter Discord is probably the best place for feedback on either.

Please don't look at the code. Thanks!

## Updating the map

Install dependencies and tools:

```console
$ pip3 install pyvips
$ sudo apt install pdftk
$ npm install
```

Extract individual pages from a PDF:

```console
$ pdftk 19450508_Unscaled_RailwayMap.pdf cat 1 output src/rails.pdf
```

Update the tiles:

```console
$ pip3 install pyvips
```

Test the result:

```console
$ rm -r dist
$ npm start
```

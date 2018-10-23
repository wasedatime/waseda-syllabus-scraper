#### How to extract schools from waseda's syllabus

1. Download the html page from [en](https://www.wsl.waseda.jp/syllabus/JAA101.php?pLng=en) and
   [jp](https://www.wsl.waseda.jp/syllabus/JAA101.php) syllabus

2. Use regex in any kind of editor and replace `<option label="([^"]+)" value="([^"]+)">[^\n]+` with `"$1":"$2",`

#### ~~Removed schools~~

~~We removed some school which cannot be found in waseda's academics webpage ([en](https://www.waseda.jp/top/en/academics), [jp](https://www.waseda.jp/top/academics))~~

~~Removed schools:~~

```
"国情研": "422000"
```

# ProfitRendszer privát alkalmazás

## Cél

A ProfitRendszer felülete telepíthető PWA-ként fusson iPhone-on, Androidon és asztali gépen. Az alkalmazás maga legyen könnyű kliens: a számításokat ne a telefon végezze, hanem a háttérrendszer; az app interneten keresztül csak a szükséges eredményeket és állapotokat kérje le.

## Végleges architektúra

1. **PWA kliens** – telepíthető mobilra és asztali gépre, saját ikonról indul, standalone módban.
2. **Privát HTTPS adatvégpont** – kizárólag hitelesített kérésre adja vissza a ProfitRendszer állapotát, PAPER téteket, eredményeket, méréseket és sportág-készültséget.
3. **ProfitRendszer háttérmotor** – a meglévő kanonikus rendszer futtatja a számításokat és frissíti a privát adatvégpont mögötti adatokat.
4. **Semmilyen titok nem kerül a kliens forráskódjába.** API token, GitHub token vagy más hozzáférési kulcs nem lehet JavaScriptben vagy publikus statikus fájlban.

## Alkalmazás működése

- internetkapcsolatnál mindig friss adatot kér;
- internet nélkül az alkalmazás váza megnyitható marad;
- a PAPER adatok nem cache-elődnek tartósan a service workerben;
- mobilon és PC-n ugyanaz az alkalmazás használható;
- App Store / Google Play publikálás nem szükséges;
- a telepítés PWA módban történik.

## Jelenlegi fejlesztési ág

`feat/privat-pwa-v1`

A branch már tartalmazza:

- telepíthető PWA manifestet mobil és desktop támogatással;
- stabilizált service workert;
- online/offline állapotjelzőt;
- támogatott böngészőknél telepítési gombot;
- automatikus alkalmazásfrissítést.

## Biztonsági feltétel

A jelenlegi publikus GitHub Pages adatút **nem tekinthető végleges privát megoldásnak**. A privát üzemhez hitelesített HTTPS adatvégpont szükséges. A kliens csak ennek beállítása után minősíthető privátnak.

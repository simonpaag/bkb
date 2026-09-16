import json
import re
from pathlib import Path

RAW = """
paul@bkbolvaerket.dk , (04) Frederikke Stenz Kirkebæk <fredestenz@hotmail.com>, rutep@mail.dk , (06) Tonny Norbrink <tonnynorbrink@hotmail.com>, michael.schultz.larsen@gmail.com , (12) Tomas Saubak <thomassoubak@gmail.com>, kis.skyd@gmail.com , (16) Charlotte Eli <charlotte@charlotteeli.dk>, mh@kts.dk , lancia77@yahoo.com , cbm@fazit.dk , (23) Søren Kragelund <sk@s-kragelund.dk>, (24) Adam Ravnkilde <adarav@icloud.com>, ktgulve@gmail.com , prcarstensen@gmail.com , simon@paag.dk , pjerrot1958@gmail.com , (30) Mikkel Randrup Rasmussen <info@meotine.com>, danielsigaard@hotmail.com , Martin Rask <martin@raskn.dk>, jeppelajer@mac.com , matejkaploug@hotmail.com , tonnybrix@hotmail.com , (39) Peter Rasmussen <pr@prig.dk>, themorten@hotmail.com , mikkel.herforth@gmail.com , thomas@carlcarl.com , (43) Thomas Bjørnlund <thomassajith@me.com>, jt@jakobthau.dk , (46) Kjeld Dickow <kjeld.dickow@gmail.com>, (51) Taus Andersen <mail@tausa.dk>, aminacharai@gmail.com , andersaugust@mac.com , (54) Thomas Bang Jespersen <tbangj@gmail.com>, (56) Nancy Harson <nancyharson@hotmail.com>, (57) Mette Stenstrup <mette@nzinck.com>, miksemail@yahoo.com , (59) Thor Munch Andersen <thormunchandersen@gmail.com>, (61) Crispin Rolt <crispin@crispin.dk>, jarl@jarlaxel.com , mr@mgtrading.dk , baumannen@gmail.com , ahansen247@gmail.com , (68) Sofie Palm <sofie_palm8@hotmail.com>, (02) Ole Mayhoff <umth@mail.tele.dk>, (10) Benjamin Hilmand <mestermichelsen@gmail.com>, (09) Christoffer Cady <christoffer.cady@gmail.com>, (22) Søren Westergård <sw@sofiekaelderen.dk>, (26) Helle Jensen <helle.jensen.vs@gmail.com>, (69) Lars Remfeldt <lars@arklar.dk>, (71) Henrik Olsen <hpo@m.dk>, (70) Kasper Højbjerg <kasperhojbjerg@hotmail.dk>, (73) Rune Bech Pedersen <rune@bechmedia.dk>, (72) David Lange <davidmlange@gmail.com>, (74) Mette Hegelund & Lars Freiberg <mette@raffinaderiet.dk>, (75) Stian Michael Hånes Olesen <stianhaanes@gmail.com>, (77) Kristian Eskesen <mdeskesen@gmail.com>, (76) Martin Bresciani <mgbresciani@gmail.com>, (78) Christian Bjerregård <cnb@nybolig.dk>, (81) Nicolai Christensen <hej@webdwarf.dk>, (83) Kristoffer Vivike <kriviv@um.dk>, (82) Sorel Kurbegovic <sorelkurbeg@gmail.com>, (33) Jonas Skovgaard-Hansen <jonas.skovgaard.hansen@gmail.com>, (85) Peter Aarup Kjær <paak77@gmail.com>, (84) Per Persson <serviceogvedligehold@gmail.com>, (79) Per Bech Thomsen <pbt@impactpartners.dk>, (86) Henrik Storch <henrik.storch@gmail.com>, (11) Caroline Rievers <caroline.rievers@gmail.com>, (62) Randi Lindeneg <lindeneg.randi@gmail.com>, (08) Jesper Ryder <jesperryder@hotmail.com>, (34) Per Jørgensen <perlenanoq@gmail.com>, (63) Søren Christiansen <soerenchristiansens@outlook.dk>
"""

KNOWN_NAMES = {
    "simon@paag.dk": "Simon Paag",
    "aminacharai@gmail.com": "Amina Charai",
    "jarl@jarlaxel.com": "Jarl Christian Axel Hansen",
    "martin@raskn.dk": "Martin Rask",
    "mr@mgtrading.dk": "Martin Rask",
    "jonas.skovgaard.hansen@gmail.com": "Jonas Skovgaard-Hansen",
    "jt@jakobthau.dk": "Jakob Thau",
    "prcarstensen@gmail.com": "P.R. Carstensen",
    "ktgulve@gmail.com": "KT Gulve",
    "cbm@fazit.dk": "CBM",
    "mh@kts.dk": "M.H.",
    "paul@bkbolvaerket.dk": "Paul",
    "themorten@hotmail.com": "Morten",
    "miksemail@yahoo.com": "Miks",
    "lancia77@yahoo.com": "Lancia",
    "rutep@mail.dk": "Rute P.",
    "pjerrot1958@gmail.com": "Pjerrot",
    "ahansen247@gmail.com": "A. Hansen",
    "thomas@carlcarl.com": "Thomas",
    "danielsigaard@hotmail.com": "Daniel Sigaard",
    "jeppelajer@mac.com": "Jeppe Lajer",
    "matejkaploug@hotmail.com": "Matej Kaploug",
    "tonnybrix@hotmail.com": "Tonny Brix",
    "andersaugust@mac.com": "Anders August",
    "baumannen@gmail.com": "Baumannen",
}

ENTRY = re.compile(
    r"""
    (?:\(\s*(\d+)\s*\)\s*)?
    (?:
        ([^,<]+?)\s*<\s*([^>]+?)\s*>
      | ([A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,})
    )
    """,
    re.VERBOSE,
)


def name_from_email(email: str) -> str:
    if email.lower() in KNOWN_NAMES:
        return KNOWN_NAMES[email.lower()]
    local = email.split("@")[0]
    local = re.sub(r"\d+", " ", local)
    local = local.replace(".", " ").replace("_", " ").replace("-", " ")
    local = re.sub(r"\s+", " ", local).strip()
    if not local:
        return email
    return " ".join(part.capitalize() for part in local.split(" "))


parsed = []
seen_emails = set()
for match in ENTRY.finditer(RAW):
    berth_raw, named, bracket_email, bare = match.groups()
    email = (bracket_email or bare or "").strip().lower()
    if not email or email in seen_emails:
        continue
    seen_emails.add(email)
    name = (named or "").strip() or name_from_email(email)
    berth_no = int(berth_raw) if berth_raw else None
    prefixed = re.match(r"^\((\d+)\)\s*(.+)$", name)
    if prefixed:
        berth_no = int(prefixed.group(1))
        name = prefixed.group(2).strip()
    if email in KNOWN_NAMES:
        name = KNOWN_NAMES[email]
    parsed.append({"name": name, "email": email, "berth": berth_no})

print(f"parsed {len(parsed)} members")
for row in parsed:
    print(f"  {row['berth'] or '—':>3}  {row['name']}  <{row['email']}>")

# Merge duplicate Martin Rask emails into one member
merged = []
rask = None
for row in parsed:
    if row["email"] in {"martin@raskn.dk", "mr@mgtrading.dk"}:
        if rask is None:
            rask = {
                **row,
                "email": "martin@raskn.dk",
                "name": "Martin Rask",
                "notes": "Også mr@mgtrading.dk" if row["email"] != "martin@raskn.dk" else "",
            }
            merged.append(rask)
        else:
            notes = "Også " + row["email"]
            rask["notes"] = (
                f"{rask['notes']}; {notes}" if rask.get("notes") else notes
            )
            if row["berth"] and not rask["berth"]:
                rask["berth"] = row["berth"]
        continue
    merged.append({**row, "notes": ""})

print(f"after merge {len(merged)}")

numbered = sorted({row["berth"] for row in merged if row["berth"]})
print("official berths", numbered)

def lerp(a, b, n, i):
    if n == 1:
        return a
    return round(a + (b - a) * i / (n - 1), 2)

north_count = (len(numbered) + 1) // 2
south_count = len(numbered) - north_count
# slightly more on the west (longer stretch)
north_west = max(1, round(north_count * 0.62))
north_east = north_count - north_west
south_west = max(1, round(south_count * 0.62))
south_east = south_count - south_west

coords = []
nw = numbered[:north_west]
ne = numbered[north_west:north_count]
sw = numbered[north_count:north_count + south_west]
se = numbered[north_count + south_west:]

for i, num in enumerate(nw):
    coords.append((num, "norden", lerp(4.2, 53.0, len(nw), i), 42.8))
for i, num in enumerate(ne):
    coords.append((num, "norden", lerp(66.5, 95.5, max(len(ne), 1), i), 42.8))
for i, num in enumerate(sw):
    coords.append((num, "sonden", lerp(5.0, 53.2, len(sw), i), 56.6))
for i, num in enumerate(se):
    coords.append((num, "sonden", lerp(66.8, 95.2, max(len(se), 1), i), 56.6))

berth_by_number = {}
berths = []
for num, side, x, y in coords:
    bid = f"plads-{num:02d}"
    berth_by_number[num] = bid
    berths.append(
        {
            "id": bid,
            "number": num,
            "side": side,
            "x": x,
            "y": y,
            "memberId": None,
        }
    )

members = []
for i, row in enumerate(merged, start=1):
    mid = f"m-{i:03d}"
    berth_id = berth_by_number.get(row["berth"]) if row["berth"] else None
    members.append(
        {
            "id": mid,
            "name": row["name"],
            "email": row["email"],
            "phone": "",
            "boatName": "",
            "boatLengthMeters": None,
            "membershipType": "baadplads" if row["berth"] else "baadplads",
            "berthId": berth_id,
            "photoPath": None,
            "notes": row.get("notes") or "",
            "createdAt": "2026-09-16T00:00:00.000Z",
        }
    )
    if berth_id:
        for berth in berths:
            if berth["id"] == berth_id:
                berth["memberId"] = mid

members.sort(key=lambda m: m["name"].casefold())
# keep stable ids after sort
for i, member in enumerate(members, start=1):
    old = member["id"]
    new = f"m-{i:03d}"
    member["id"] = new
    for berth in berths:
        if berth["memberId"] == old:
            berth["memberId"] = new

root = Path("/Users/simonpaag/BKBolværket/intranet/data")
(root / "members.json").write_text(json.dumps(members, ensure_ascii=False, indent=2) + "\n")
(root / "berths.json").write_text(json.dumps(berths, ensure_ascii=False, indent=2) + "\n")
print("wrote", len(members), "members and", len(berths), "berths")
print("north", [b["number"] for b in berths if b["side"] == "norden"])
print("south", [b["number"] for b in berths if b["side"] == "sonden"])

-- Igre iz PDF kataloga, ukupno: 44. Bez slika – Ignjat ih dodaje kroz "Izmeni".
-- Pokreni u Supabase SQL Editoru. Može da se pokrene više puta: postojeće igre (isti naziv) se preskaču.

-- slika nije obavezna dok se ne doda fotografija
alter table public.games alter column image_url drop not null;

-- isti naziv ne može dva puta
create unique index if not exists games_name_unique on public.games (lower(name));

insert into public.games (name, players_min, players_max, time_min, time_max, weight, description, tags)
values
  ('That''s Not a Hat', 3, 8, 15, null, 1.05, 'Brza party igra pamćenja i blefiranja u kojoj naizmenično prosleđujete predmete jedni drugima oslanjajući se na memoriju.', array['Party', 'Pamćenje', 'Blefiranje']::text[]),
  ('Poklon (The Gift)', 2, 6, 20, null, 1.07, 'Dinamična kartična igra koja vas stavlja pred izazov strateškog pozicioniranja i postavljanja karata u ograničenu 3x4 mrežu.', array['Kartaška igra', 'Postavljanje u mrežu']::text[]),
  ('Love Letter', 2, 6, 20, null, 1.18, 'Mikro igra brze dedukcije, rizika i sreće u kojoj na sve načine pokušavate da dostavite tajno pismo princezi na dvoru.', array['Dedukcija', 'Mikro igra']::text[]),
  ('Alias', 4, 12, 45, null, 1.2, 'Neprevaziđeni klasik među party igrama koji testira vašu brzinu razmišljanja kroz asocijacije i objašnjavanje zadatih reči.', array['Party', 'Asocijacije', 'Reči']::text[]),
  ('Codenames', 2, 8, 15, null, 1.23, 'Fenomenalna timska asocijativna igra sa špijunskom tematikom, gde šifrovanim rečima pokušavate da pronađete svoje tajne agente.', array['Timska', 'Asocijacije', 'Dedukcija']::text[]),
  ('Dvorani (Courtisans)', 2, 5, 30, null, 1.3, 'Jednostavna, ali vrlo taktička igra intriga u kojoj se manipulacijom borite za uticaj i naklonost zavađenih plemića na dvoru.', array['Sakupljanje setova', 'Draftovanje']::text[]),
  ('Omerta', 3, 5, 20, null, 1.33, 'Dinamična kartaška igra sa mafijaškom temom i snažnim blefiranjem u kojoj je jedini cilj da se pametno oslobodite karata u ruci.', array['Pamćenje', 'Kartaška igra', 'Blefiranje']::text[]),
  ('One Night Ultimate Werewolf', 3, 10, 10, null, 1.38, 'Ekstremno brza socijalna dedukcija i blefiranje skrivenih uloga sa partijama koje traju svega desetak minuta, bez ispadanja igrača.', array['Skrivene uloge', 'Socijalna dedukcija']::text[]),
  ('Coup', 2, 6, 15, null, 1.41, 'Intenzivna, nemilosrdna igra brutalnog blefiranja, ranih eliminacija i manipulacija unutar korumpiranog sajberpank univerzuma.', array['Blefiranje', 'Eliminacija', 'Skrivene uloge']::text[]),
  ('Arhitekte (7 Wonders Architects)', 2, 7, 25, null, 1.42, 'Brža i porodično orijentisana verzija popularne igre, maksimalno usredsređena na zadovoljavajuću vizuelnu izgradnju antičkih svetskih čuda.', array['Draftovanje', 'Građenje grada']::text[]),
  ('Papreno (Spicy)', 2, 6, 20, null, 1.43, 'Unikatna igra blefiranja sa prelepim ilustracijama velikih mačaka, u kojoj se takmičite koristeći vrednosti ljutih začina.', array['Blefiranje', 'Kartaška igra']::text[]),
  ('Morska so (Sea Salt & Paper)', 2, 4, 30, 45, 1.48, 'Kompaktna kartična igra sa zadivljujućim origami morskim motivima gde sakupljate najbolje setove za visoko bodovanje.', array['Sakupljanje setova', 'Kartaška igra']::text[]),
  ('Šerif (Sheriff of Nottingham)', 3, 6, 60, null, 1.71, 'Komedija od igre zasnovana na ubeđivanju i pregovaranju, u kojoj hrabro švercujete ilegalnu robu nadajući se da će vas šerif pustiti.', array['Blefiranje', 'Pregovaranje']::text[]),
  ('Zamak Combo (Castle Combo)', 2, 5, 20, 30, 1.74, 'Brzo građenje lične table preplitanjem i kombinovanjem odigranih karata zarad okupljanja najboljih stanovnika u vaš dvorac.', array['Građenje table', 'Kartaška igra']::text[]),
  ('Avalon (The Resistance)', 5, 10, 30, null, 1.74, 'Vrhunska, neverovatno tenzična igra skrivenih uloga, obmane i konstantne dedukcije lukavo smeštena u doba kralja Artura.', array['Skrivene uloge', 'Socijalna dedukcija', 'Timska']::text[]),
  ('Splendor', 2, 4, 30, null, 1.77, 'Brz i izuzetno elegantan trgovački klasik sa žetonima posvećen sakupljanju raznobojnih dragulja i ekonomske izgradnje prestiža.', array['Ekonomija', 'Menadžment resursa']::text[]),
  ('Between 2 Cities', 3, 7, 25, null, 1.81, 'Inovativna kooperativno-kompetitivna igra gde istovremeno gradite dva različita grada deleći trud sa igračima levo i desno od vas.', array['Građenje grada', 'Postavljanje pločica']::text[]),
  ('Art of Society', 2, 4, 30, null, 1.87, 'Sakupljanje, čuvanje i mudro izlaganje retkih, skupocenih umetničkih dela u formi jako napetog aukcijskog nadmetanja.', array['Aukcija', 'Sakupljanje setova']::text[]),
  ('Daleke zemlje (Faraway)', 2, 6, 30, null, 1.94, 'Neobična kartaška igra sakupljanja setova smeštena u misteriozni fantastični svet, ukrašena mehanikom obrnutog redosleda bodovanja.', array['Kartaška igra', 'Sakupljanje setova']::text[]),
  ('Carcassonne', 2, 5, 30, 45, 1.95, 'Jedna od najpoznatijih igara postavljanja pločica u kojoj sa protivnicima na stolu zajednički gradite srednjovekovne gradove, polja i puteve.', array['Postavljanje pločica', 'Kontrola teritorije']::text[]),
  ('1400 (Chronicles of Crime)', 1, 4, 60, 90, 2.0, 'Inovativna deduktivna igra ozbiljnog rešavanja zločina u Parizu 15. veka pomoću moderne i sjajno dizajnirane prateće aplikacije.', array['Dedukcija', 'Aplikacija']::text[]),
  ('Rebirth', 2, 4, 45, null, 2.0, null, '{}'::text[]),
  ('Catan', 3, 4, 60, 120, 2.28, 'Nadaleko najpoznatija trgovačka igra o bacanju kockica, sakupljanju osnovnih sirovina, agresivnom pregovaranju i naseljavanju plodnog ostrva.', array['Pregovaranje', 'Trgovina']::text[]),
  ('7 Wonders', 3, 7, 30, null, 2.31, 'Strateški simultan draft karata kroz koji paralelno razvijate svoju moćnu antičku civilizaciju gradeći moćnu vojsku i nauku.', array['Draftovanje', 'Civilizacija']::text[]),
  ('Ra', 2, 5, 45, 60, 2.32, 'Fenomenalna, dinamična igra direktne licitacije, pohlepe i konstantne procene rizika, majstorski uvijena u ambijent drevnog Egipta.', array['Aukcija', 'Procena rizika']::text[]),
  ('King of Monster Island', 1, 5, 45, 60, 2.33, 'Spektakularna kooperativna zabava u kojoj se ogromna, mutirana čudovišta udruženo bore protiv onog najvećeg — zlog bosa na ostrvu.', array['Kooperativna', 'Bacanje kockica']::text[]),
  ('Ambis (Abyss)', 2, 4, 45, null, 2.34, 'Očaravajuća i izuzetno brza igra sakupljanja setova resursa radi kupovine i sticanja snažnih saveznika u skrivenim dubinama okeana.', array['Sakupljanje setova', 'Menadžment ruku']::text[]),
  ('Istanbul', 2, 5, 40, 60, 2.48, 'Taktičko i izuzetno tesno pomeranje radnika kroz uske ulice šarenog turskog bazara u neprestanoj trci za dragocenim rubinima.', array['Kretanje po mreži', 'Trka']::text[]),
  ('Wingspan', 1, 5, 40, 70, 2.48, 'Opuštajuća, ali duboka "engine-building" igra posvećena stvaranju uspešnog prirodnog rezervata za stotine autentičnih vrsta ptica.', array['Engine building', 'Priroda']::text[]),
  ('Clank! Catacombs', 2, 4, 45, 90, 2.49, 'Uzbudljiv, često histeričan spoj građenja špila (deck-building) i bučnog trčanja kroz modularne podzemne lavirinte iz kojih vreba zmaj.', array['Deck building', 'Istraživanje']::text[]),
  ('Amazonia (Canopy)', 1, 2, 30, 45, 2.83, 'Izvrsno dizajnirano taktičko draftovanje karata za maksimalno dva igrača usmereno isključivo na uspešno obnavljanje i rast kišne prašume.', array['Draftovanje', 'Za dvoje']::text[]),
  ('Five Tribes', 2, 4, 40, 80, 2.84, 'Vizuelno bogata, izuzetno duboka strateška igra sa jedinstvenom "mankala" mehanikom pomeranja figurica i osiguravanja bitnih oaza.', array['Mankala', 'Modularna tabla']::text[]),
  ('Vitezovi', 2, 4, 60, null, 2.9, 'Nemilosrdan taktički sukob prekaljenih vitezova i vojnih trupa u beskrupuloznoj borbi za potpunu kontrolu nad srednjovekovnim tvrđavama.', array['Kontrola teritorije']::text[]),
  ('Rat u zemlji čuda (Wonderland''s War)', 2, 5, 60, 90, 3.04, 'Zabavna mešavina asimetrične kontrole teritorije i mehanike izvlačenja tokena iz vreće (bag building) unutar turobnog sveta Alise u zemlji čuda.', array['Kontrola teritorije', 'Bag building']::text[]),
  ('Beli dvorac (The White Castle)', 1, 4, 45, 80, 3.05, 'Neverovatno elegantna euro strategija u feudalnom Japanu koja igračima nudi minimalan broj akcija uz ogromnu težinu posledica.', array['Postavljanje kockica', 'Menadžment resursa']::text[]),
  ('Mars (Terraforming Mars)', 1, 5, 120, null, 3.27, 'Kapitalna SF korporativna strategija prepuna dugoročnog planiranja čiji je osnovni cilj podizanje temperature, atmosfere i ozelenjavanje Marsa.', array['Engine building', 'Menadžment resursa']::text[]),
  ('Agricola', 1, 5, 30, 150, 3.44, 'Žanrovska ikona postavljanja radnika (worker-placement) u kojoj gradite poljoprivrednu farmu, sejete useve i očajnički obezbeđujete hranu za porodicu.', array['Postavljanje radnika', 'Razvoj']::text[]),
  ('Dune Imperium Uprising', 1, 6, 60, 120, 3.52, 'Složeni imperijalni spletkovi, naoružavanje vojske i surova diplomatska borba oko osiguravanja prevlasti nad peščanom planetom Arrakis.', array['Deck building', 'Postavljanje radnika']::text[]),
  ('GWT (Great Western Trail)', 1, 4, 75, 150, 3.71, 'Kompleksno logističko planiranje prilikom prezahtevnog, dugog i opasnog prevođenja sopstvenog vrednog krda krava od Teksasa do Kanzasa.', array['Logistika', 'Deck building']::text[]),
  ('Igre prestola (A Game of Thrones)', 3, 6, 120, 240, 3.74, 'Epska društvena borba za apsolutnu prevlast, prepuna neizbežne brutalne diplomatije i iznenadnih krvavih izdaja radi osvajanja Gvozdenog Prestola.', array['Kontrola teritorije', 'Pregovaranje', 'Izdaja']::text[]),
  ('Caverna', 1, 7, 30, 210, 3.77, 'Bogat i otvoren naslednik Agricole u kojem opremate brojnu patuljačku porodicu i šaljete ih na iskopavanje vrednih ruda ili opasne ekspedicije.', array['Postavljanje radnika', 'Menadžment resursa']::text[]),
  ('World Order', 2, 4, 120, null, 3.78, 'Masivna, nepredvidiva geopolitička strategija u kojoj kao vrhovni lider pažljivo usmeravate tok moderne svetske istorije upravljajući velikim silama.', array['Geopolitika', 'Velika strategija']::text[]),
  ('Ark Nova', 1, 4, 90, 150, 3.79, 'Jedna od najhvaljenijih i najizazovnijih euro igara današnjice, posvećena vrhunskom dizajniranju, sponzorisanju i planiranju impresivnog zoološkog vrta.', array['Menadžment ruku', 'Engine building']::text[]),
  ('Seti (SETI)', 1, 4, 40, 160, 3.81, 'Izuzetno teški euro naslov primarno baziran na slanju moćnih sondi i dubinskoj naučnoj potrazi za neoborivim dokazima o vanzemaljskoj inteligenciji.', array['Engine building']::text[])
on conflict do nothing;

select count(*) as ukupno_igara from public.games;

-- YouTube tutoriali i pravila iz prezentacije + igre koje su falile u PDF katalogu.
-- Pokreni u Supabase SQL Editoru. Može da se pokrene više puta.

-- 1) "Vitezovi" iz PDF kataloga je Catan: Vitezovi (proširenje za Catan)
update public.games
set name = 'Catan: Vitezovi', players_min = 3, players_max = 4, time_min = 90, time_max = null
where name = 'Vitezovi';

-- 2) Igre koje su bile odsečene u PDF-u (10). Težina, igrači i trajanje su okvirni – proveriti na Mipl-u.
insert into public.games (name, players_min, players_max, time_min, time_max, weight, description, tags)
values
  ('Hegemony', 2, 4, 90, 180, 3.9, 'Asimetrična ekonomsko-politička strategija u kojoj svaki igrač vodi drugu društvenu klasu – radnike, srednju klasu, kapitaliste ili državu – i bori se da njegova politika odnese prevagu.', array['Ekonomija', 'Geopolitika', 'Velika strategija']::text[]),
  ('Tapestry', 1, 5, 90, 120, 2.9, 'Vodite civilizaciju od samih početaka kroz četiri puta napretka – istraživanje, nauku, tehnologiju i vojsku – gradeći sopstveni grad od minijaturnih zgrada.', array['Civilizacija', 'Engine building']::text[]),
  ('Bitka igračaka (Toy Battle)', 2, 2, 20, null, 1.8, 'Brza taktička igra za dvoje u kojoj vojske igračaka postavljate na tablu i borite se za kontrolu nad poljima dečje sobe.', array['Za dvoje', 'Kontrola teritorije']::text[]),
  ('Find a Clue', 3, 6, 45, null, 1.6, 'Klasična detektivska igra u kojoj obilazite prostorije, postavljate pretpostavke i eliminacijom otkrivate ko je počinio zločin, kojim oružjem i gde.', array['Dedukcija']::text[]),
  ('Priroda (Harmonies)', 1, 4, 30, 45, 1.9, 'Opuštajuća igra slaganja pejzaža od žetona u kojoj stvarate šume, reke i planine i u njih naseljavate životinje kojima taj predeo odgovara.', array['Postavljanje pločica', 'Priroda']::text[]),
  ('Wispwood', 1, 4, 30, 60, 2.0, 'Čarobna igra slaganja pločica u kojoj u svetlucavoj šumi pažljivo raspoređujete stvorenja i biljke da biste ostvarili što više bodova.', array['Postavljanje pločica', 'Priroda']::text[]),
  ('Hues and Cues', 3, 10, 30, null, 1.1, 'Zabavna party igra asocijacija na boje: jednom ili dvema rečima opisujete nijansu, a ostali pokušavaju da je pronađu na tabli sa 480 boja.', array['Party', 'Asocijacije']::text[]),
  ('Endeavor: Deep Sea', 1, 4, 60, 90, 2.8, 'Strateško istraživanje okeanskih dubina u kojem šaljete ekspedicije, otkrivate morski svet i gradite ugled istraživačke organizacije.', array['Istraživanje', 'Kontrola teritorije']::text[]),
  ('Vinhos', 1, 4, 90, 135, 4.0, 'Zahtevna ekonomska strategija o proizvodnji vina u Portugalu – kupujete vinograde, zapošljavate enologe, pravite vino i takmičite se na sajmovima.', array['Ekonomija', 'Menadžment resursa']::text[]),
  ('Citadela (Citadels)', 2, 8, 30, 60, 2.1, 'Klasična kartaška igra tajnih uloga u kojoj svake runde birate lik – kralja, ubicu, lopova ili arhitektu – i gradite najlepši srednjovekovni grad.', array['Skrivene uloge', 'Blefiranje', 'Draftovanje']::text[])
on conflict do nothing;

-- 3) Linkovi za 54 igara
update public.games g
set youtube_url = l.yt, rules_pdf_url = l.pdf
from (values
  ('Splendor', 'https://www.youtube.com/watch?v=AvQ1_McqT3A', 'https://board-game-rules.com/wp-content/uploads/2025/01/splendor_Official-Rules.pdf'),
  ('Šerif (Sheriff of Nottingham)', 'https://www.youtube.com/watch?v=He8wKTnWeaE', 'https://www.drustveneigre.rs/pravila/serif_od_notingema_pravila.pdf'),
  ('Istanbul', 'https://www.youtube.com/watch?v=0u9F93vnxFU', 'https://board-game-rules.com/wp-content/uploads/2025/01/istanbul_Official-Rules.pdf'),
  ('Catan', 'https://www.youtube.com/watch?v=oGg-6PxCjIk', 'https://www.drustveneigre.rs/pravila/catan_2025_pravila_na_srpskom.pdf'),
  ('Catan: Vitezovi', 'https://www.youtube.com/watch?v=LROxwuKDFPE', 'https://www.drustveneigre.rs/pravila/catan_gradovi_i_vitezovi_pravila_na_srpskom.pdf'),
  ('Amazonia (Canopy)', 'https://www.youtube.com/watch?v=iNxA_7sonnY', 'https://board-game-rules.com/wp-content/uploads/2025/01/life-of-the-amazonia_Official-Rules.pdf'),
  ('Ark Nova', 'https://www.youtube.com/watch?v=kfWZIM5L0yA', 'https://www.drustveneigre.rs/pravila/ark_nova_pravila.pdf'),
  ('GWT (Great Western Trail)', 'https://www.youtube.com/watch?v=OeVz0mQsTl8', 'https://board-game-rules.com/wp-content/uploads/2025/01/great-western-trail-second-edition_Official-Rules.pdf'),
  ('Agricola', 'https://www.youtube.com/watch?v=LWuUuxbMDB0', 'https://board-game-rules.com/wp-content/uploads/2025/01/agricola-revised-edition_Official-Rules.pdf'),
  ('Caverna', 'https://www.youtube.com/watch?v=n_tZE3-dAYQ', 'https://board-game-rules.com/wp-content/uploads/2025/01/caverna-the-cave-farmers_Official-Rules.pdf'),
  ('Wingspan', 'https://www.youtube.com/watch?v=54Z83jBDCDI', 'https://www.drustveneigre.rs/pravila/wingspan_pravila.pdf'),
  ('Hegemony', 'https://www.youtube.com/watch?v=jPsGOS3ka1c', 'https://board-game-rules.com/wp-content/uploads/2025/01/hegemony-lead-your-class-to-victory_Official-Rules.pdf'),
  ('World Order', 'https://www.youtube.com/watch?v=HkVjCpd_9G0', 'https://games-for-you.oozmi-cdn.com/products/8d6f2f27-1305-4a67-bbf4-f06eede5f528/pdfs/pravila_igre_rulebook_en.pdf'),
  ('Rebirth', 'https://www.youtube.com/watch?v=gymWKuwsfp4', 'https://board-game-rules.com/wp-content/uploads/2026/10/rebirth_Official-Rules.pdf'),
  ('Igre prestola (A Game of Thrones)', 'https://www.youtube.com/watch?v=X0XRVTacNxI', 'https://board-game-rules.com/wp-content/uploads/2025/01/a-game-of-thrones-the-board-game-second-edition_Official-Rules.pdf'),
  ('Carcassonne', 'https://www.youtube.com/watch?v=TOXeYt5tgkI', 'https://board-game-rules.com/wp-content/uploads/2025/01/carcassonne_Official-Rules.pdf'),
  ('Tapestry', 'https://www.youtube.com/watch?v=J-O5ebm5Ea4', 'https://board-game-rules.com/wp-content/uploads/2025/01/tapestry_Official-Rules.pdf'),
  ('Mars (Terraforming Mars)', 'https://www.youtube.com/watch?v=B1j-mBcHnJQ', 'https://www.drustveneigre.rs/pravila/teraformiranje_marsa_pravila.pdf'),
  ('Seti (SETI)', 'https://www.youtube.com/watch?v=dHUqPmrXuJY', 'https://www.drustveneigre.rs/pravila/seti_pravila_na_srpskom.pdf'),
  ('Dune Imperium Uprising', 'https://www.youtube.com/watch?v=3cwzF63F0ks', 'https://board-game-rules.com/wp-content/uploads/2025/01/dune-imperium-uprising_Official-Rules.pdf'),
  ('Ambis (Abyss)', 'https://www.youtube.com/watch?v=Rq0TYK1hgdE', 'https://www.drustveneigre.rs/pravila/ambis_pravila_na_srpskom.pdf'),
  ('Daleke zemlje (Faraway)', 'https://www.youtube.com/watch?v=mB22wnmQn6Y', 'https://www.drustveneigre.rs/pravila/daleke_zemlje_pravila_na_srpskom.pdf'),
  ('Alias', 'https://www.youtube.com/watch?v=HMCbkHGN5X0', 'https://data.igrackedenis.hr/assets/170-90510/Ostalo/Pravila%20igre_170-90510_ALIAS_PARTY.pdf'),
  ('King of Monster Island', 'https://www.youtube.com/watch?v=SmPd9U1x010', 'https://iellogames.com/wp-content/uploads/2022/11/KOMI_Rulebook_EN_Light.pdf'),
  ('That''s Not a Hat', 'https://www.youtube.com/watch?v=uAC91HVUxJo', 'https://pocztaplanszowkowa.s3.eu-central-1.amazonaws.com/24325/Rulebook_Thats_not_a_hat.pdf'),
  ('Poklon (The Gift)', 'https://www.youtube.com/watch?v=Jr9DwOuF_Yk', 'https://www.drustveneigre.rs/pravila/poklon_pravila_na_srpskom.pdf'),
  ('Bitka igračaka (Toy Battle)', 'https://www.youtube.com/watch?v=0u9rGVIHuxI', 'https://www.drustveneigre.rs/pravila/bitka_igracaka_pravila_na_srpskom.pdf'),
  ('Clank! Catacombs', 'https://www.youtube.com/watch?v=lCoV-fFSAvM', 'https://board-game-rules.com/wp-content/uploads/2025/01/clank-catacombs_Official-Rules.pdf'),
  ('Codenames', 'https://www.youtube.com/watch?v=ZHYusbl4U04', 'https://www.drustveneigre.rs/pravila/codenames_slike_pravila_na_srpskom.pdf'),
  ('Dvorani (Courtisans)', 'https://www.youtube.com/watch?v=lqwHi6KfJ0c', 'https://www.drustveneigre.rs/pravila/dvorani_pravila_na_srpskom.pdf'),
  ('Avalon (The Resistance)', 'https://www.youtube.com/watch?v=rXlK3NZjLGc', 'https://board-game-rules.com/wp-content/uploads/2025/01/the-resistance-avalon_Official-Rules.pdf'),
  ('Coup', 'https://www.youtube.com/watch?v=mbZQJPVanhw', 'https://board-game-rules.com/wp-content/uploads/2025/01/coup_Official-Rules.pdf'),
  ('Find a Clue', 'https://www.youtube.com/watch?v=WAAUmIIM0p8', 'https://www.hasbro.com/common/instruct/clueins.pdf'),
  ('1400 (Chronicles of Crime)', 'https://www.youtube.com/watch?v=e80byF97X6E', 'https://www.drustveneigre.rs/pravila/hronike_zlocina_1400_pravila_na_srpskom.pdf'),
  ('Love Letter', 'https://www.youtube.com/watch?v=BX2UU4qi2lI', 'https://board-game-rules.com/wp-content/uploads/2025/01/love-letter_Official-Rules.pdf'),
  ('Omerta', 'https://www.youtube.com/watch?v=X8oWrLA9S6c', 'https://www.drustveneigre.rs/pravila/omerta_pravila.pdf'),
  ('Papreno (Spicy)', 'https://www.youtube.com/watch?v=-v35EpYVYpk', 'https://www.drustveneigre.rs/pravila/papreno_pravila.pdf'),
  ('One Night Ultimate Werewolf', 'https://www.youtube.com/watch?v=7rwi40IG-_0', 'https://board-game-rules.com/wp-content/uploads/2025/01/one-night-ultimate-werewolf_Official-Rules.pdf'),
  ('Priroda (Harmonies)', 'https://www.youtube.com/watch?v=NlygiFc_xNY', 'https://gamerules.com/rules/harmonies/'),
  ('Wispwood', 'https://www.youtube.com/watch?v=H3kYeZBc-NQ', 'https://filemanager.czechgames.com/storage/files/wispwood/rules/wispwood-rulebook-english-2025-10-09.pdf'),
  ('Between 2 Cities', 'https://www.youtube.com/watch?v=ECSttXQZ6VE', 'https://funmill.ru/images/rules/02670.pdf'),
  ('Beli dvorac (The White Castle)', 'https://www.youtube.com/watch?v=W0QsRZllzOA', 'https://board-game-rules.com/wp-content/uploads/2025/01/the-white-castle_Official-Rules.pdf'),
  ('Art of Society', 'https://www.youtube.com/watch?v=SzZEZfUh0PI', 'https://games-for-you.oozmi-cdn.com/products/3ced3bc4-7955-4a80-bdf0-d4bd4a1d40a7/pdfs/pravila-igre-na-engleskom-rulebook.pdf'),
  ('Hues and Cues', 'https://www.youtube.com/watch?v=oZSveXpjbak', 'https://board-game-rules.com/wp-content/uploads/2025/01/hues-and-cues_Official-Rules.pdf'),
  ('Endeavor: Deep Sea', 'https://www.youtube.com/watch?v=HLfcG_7rbT0', 'https://board-game-rules.com/wp-content/uploads/2025/01/endeavor-deep-sea_Official-Rules.pdf'),
  ('Vinhos', 'https://www.youtube.com/watch?v=VoX0FLDtPBM', 'https://board-game-rules.com/wp-content/uploads/2025/01/vinhos-deluxe-edition_Official-Rules.pdf'),
  ('Rat u zemlji čuda (Wonderland''s War)', 'https://www.youtube.com/watch?v=InFCPUb2-vQ', 'https://board-game-rules.com/wp-content/uploads/2025/01/wonderlands-war_Official-Rules.pdf'),
  ('Morska so (Sea Salt & Paper)', 'https://www.youtube.com/watch?v=BH_zFgJ1eDU', 'https://www.drustveneigre.rs/pravila/morska_so_i_papir_pravila.pdf'),
  ('7 Wonders', 'https://www.youtube.com/watch?v=Dw6HfXp5K0E', 'https://www.drustveneigre.rs/pravila/7_wonders_pravila_na_srpskom.pdf'),
  ('Arhitekte (7 Wonders Architects)', 'https://www.youtube.com/watch?v=SJvGd1MCMNE', 'https://board-game-rules.com/wp-content/uploads/2025/01/7-wonders-architects_Official-Rules.pdf'),
  ('Citadela (Citadels)', 'https://www.youtube.com/watch?v=YU7tu2NgAn8', 'https://board-game-rules.com/wp-content/uploads/2025/01/citadels_Official-Rules.pdf'),
  ('Ra', 'https://www.youtube.com/watch?v=HubpjBwlbZ4', 'https://bghub.org/r/ra.pdf'),
  ('Zamak Combo (Castle Combo)', 'https://www.youtube.com/watch?v=UGex4EbL-tE', 'https://www.drustveneigre.rs/pravila/zamak_kombo_pravila_na_srpskom.pdf'),
  ('Five Tribes', 'https://www.youtube.com/watch?v=hfvDro2ecFw', 'https://board-game-rules.com/wp-content/uploads/2025/01/five-tribes-the-djinns-of-naqala_Official-Rules.pdf')
) as l(name, yt, pdf)
where g.name = l.name;

-- Provera: igre bez linkova (treba da bude prazno)
select name as igra_bez_linka from public.games where youtube_url is null or rules_pdf_url is null order by name;

select count(*) as ukupno_igara, count(youtube_url) as sa_videom, count(rules_pdf_url) as sa_pravilima from public.games;

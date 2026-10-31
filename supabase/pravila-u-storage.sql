-- PDF pravila iz našeg Storage-a (bucket "rules"), da se čitaju na sajtu i rade offline.
-- PRE OVOGA: otpremi sve fajlove iz foldera pravila-pdf/ u Supabase → Storage → rules.
-- YouTube link se upisuje samo igrama koje ga nemaju.

update public.games g
set rules_pdf_url = l.pdf,
    youtube_url = coalesce(g.youtube_url, l.yt)
from (values
  ('268db85b-f011-4b79-b13f-5163d3888b82'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/1400-chronicles-of-crime.pdf', 'https://www.youtube.com/watch?v=e80byF97X6E'),  -- 1400 (Chronicles of Crime)
  ('01d3195d-44c2-4ea4-b31b-2e3c7879343f'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/7-wonders.pdf', 'https://www.youtube.com/watch?v=Dw6HfXp5K0E'),  -- 7 Wonders
  ('f4a13081-6311-495d-bfd9-5307a89e5e99'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/agricola.pdf', 'https://www.youtube.com/watch?v=LWuUuxbMDB0'),  -- Agricola
  ('2239a813-30b0-4945-944b-0aa30a588854'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/alias.pdf', 'https://www.youtube.com/watch?v=HMCbkHGN5X0'),  -- Alias
  ('8d3dc5d6-c71a-4a01-82b2-d4d4e83f0628'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/amazonia-canopy.pdf', 'https://www.youtube.com/watch?v=iNxA_7sonnY'),  -- Amazonia (Canopy)
  ('2a8f5a6d-b79a-4c2f-8fc8-c34be7c0a109'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/ambis-abyss.pdf', 'https://www.youtube.com/watch?v=Rq0TYK1hgdE'),  -- Ambis (Abyss)
  ('548f2d09-1a00-4988-947d-58c82c1a5831'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/arhitekte-7-wonders-architects.pdf', 'https://www.youtube.com/watch?v=SJvGd1MCMNE'),  -- Arhitekte (7 Wonders Architects)
  ('7c8fdc93-cf99-4fbd-84c8-970093f2d439'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/ark-nova.pdf', 'https://www.youtube.com/watch?v=kfWZIM5L0yA'),  -- Ark Nova
  ('3dd4771f-cf4c-4612-8327-516584a6e3af'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/art-of-society.pdf', 'https://www.youtube.com/watch?v=SzZEZfUh0PI'),  -- Art of Society
  ('da4602b3-9a1f-41bd-8734-ac03e0a3f037'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/avalon-the-resistance.pdf', 'https://www.youtube.com/watch?v=rXlK3NZjLGc'),  -- Avalon (The Resistance)
  ('b94061a3-0c5c-44f0-a00f-91130342c62f'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/azul.pdf', null),  -- Azul
  ('bcd40e81-4139-4428-a1cf-23c6484cc9e4'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/beli-dvorac-the-white-castle.pdf', 'https://www.youtube.com/watch?v=W0QsRZllzOA'),  -- Beli dvorac (The White Castle)
  ('9843715e-716c-43ce-a7b3-f4b7c1b5ccd2'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/between-2-cities.pdf', 'https://www.youtube.com/watch?v=ECSttXQZ6VE'),  -- Between 2 Cities
  ('7f80ad8c-6523-40c1-94ff-54b3b5aa2e8f'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/bitka-igracaka-toy-battle.pdf', 'https://www.youtube.com/watch?v=0u9rGVIHuxI'),  -- Bitka igracaka
  ('0829c48c-ebdc-44ce-9416-212e7957d4c9'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/carcassonne.pdf', 'https://www.youtube.com/watch?v=TOXeYt5tgkI'),  -- Carcassonne
  ('6857fe44-0ab9-4ece-8940-7b713cc12b7b'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/catan.pdf', 'https://www.youtube.com/watch?v=oGg-6PxCjIk'),  -- Catan
  ('a0f99692-da84-4f33-ad91-2a57f7f904a3'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/catan-vitezovi.pdf', 'https://www.youtube.com/watch?v=LROxwuKDFPE'),  -- Catan vitezovi
  ('1687fbb3-d5c9-4371-8d36-4f26fbdcdb87'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/caverna.pdf', 'https://www.youtube.com/watch?v=n_tZE3-dAYQ'),  -- Caverna
  ('95730aae-d803-490a-b319-e0fa86e9a98e'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/citadela-citadels.pdf', 'https://www.youtube.com/watch?v=YU7tu2NgAn8'),  -- Citadela (Citadels)
  ('f1119556-6b3f-4290-83a7-58d3cba0f0e7'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/clank-catacombs.pdf', 'https://www.youtube.com/watch?v=lCoV-fFSAvM'),  -- Clank! Catacombs
  ('32cd5f33-84d6-40ce-910e-58fcaa1814ec'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/find-a-clue.pdf', 'https://www.youtube.com/watch?v=WAAUmIIM0p8'),  -- Cluedo
  ('84bf5990-1011-4ce9-9448-6576dfc444a1'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/codenames.pdf', 'https://www.youtube.com/watch?v=ZHYusbl4U04'),  -- Codenames
  ('43697a82-69d4-4cf8-8669-3d9ca282a111'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/coup.pdf', 'https://www.youtube.com/watch?v=mbZQJPVanhw'),  -- Coup
  ('4c0fb6b1-8fec-4d01-bfcf-e6ae7b4369aa'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/daleke-zemlje-faraway.pdf', 'https://www.youtube.com/watch?v=mB22wnmQn6Y'),  -- Daleke zemlje (Faraway)
  ('7ec99663-7ea8-4fda-90da-396aeb9692a7'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/dune-imperium-uprising.pdf', 'https://www.youtube.com/watch?v=3cwzF63F0ks'),  -- Dune Imperium Uprising
  ('1eed33aa-cad4-46e1-8510-2c08cd751945'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/dvorani-courtisans.pdf', 'https://www.youtube.com/watch?v=lqwHi6KfJ0c'),  -- Dvorani
  ('0c676ea0-f722-4ee4-9dff-8e6c492b87d5'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/endeavor-deep-sea.pdf', 'https://www.youtube.com/watch?v=HLfcG_7rbT0'),  -- Endeavor deep sea
  ('f2d3429b-9fe5-49af-b12c-cc11b338be64'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/five-tribes.pdf', 'https://www.youtube.com/watch?v=hfvDro2ecFw'),  -- Five Tribes
  ('e25205ef-ac0e-4d5a-b908-63edf48c0f1b'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/gwt-great-western-trail.pdf', 'https://www.youtube.com/watch?v=OeVz0mQsTl8'),  -- GWT (Great Western Trail)
  ('a4f0d073-68ad-4b2f-8b2a-794e5681b7e9'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/hegemony.pdf', 'https://www.youtube.com/watch?v=jPsGOS3ka1c'),  -- Hegemony
  ('e06418b7-e227-483f-a5b2-70962e4219cf'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/1400-chronicles-of-crime.pdf', 'https://www.youtube.com/watch?v=e80byF97X6E'),  -- Hronike zlocina 1400
  ('8dfa7107-dfd9-4549-8120-f92c92445d66'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/hues-and-cues.pdf', 'https://www.youtube.com/watch?v=oZSveXpjbak'),  -- Hues and clues
  ('222ed54c-48fe-4879-ad06-7fe4c01141b0'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/igre-prestola-a-game-of-thrones.pdf', 'https://www.youtube.com/watch?v=X0XRVTacNxI'),  -- Igre prestola (A Game of Thrones)
  ('500fe685-3f29-4023-b690-b6cfbbe422f0'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/istanbul.pdf', 'https://www.youtube.com/watch?v=0u9F93vnxFU'),  -- Istanbul
  ('3db3f97a-eefc-43aa-b29c-d57e99244db8'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/king-of-monster-island.pdf', 'https://www.youtube.com/watch?v=SmPd9U1x010'),  -- King of Monster Island
  ('6caf3dfc-dded-4b0b-aeb1-f2e0a237f35f'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/kojot.pdf', null),  -- Kojot
  ('8609bf6a-04bb-4216-9af0-c47e357e9a43'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/love-letter.pdf', 'https://www.youtube.com/watch?v=BX2UU4qi2lI'),  -- Love Letter
  ('b3153e94-628f-41ab-a337-0124defab91b'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/morska-so-sea-salt-paper.pdf', 'https://www.youtube.com/watch?v=BH_zFgJ1eDU'),  -- Morska so (Sea Salt & Paper)
  ('2579e522-ad20-431c-88ab-170da775bebe'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/omerta.pdf', 'https://www.youtube.com/watch?v=X8oWrLA9S6c'),  -- Omerta
  ('5d83c088-6e9c-47d2-94af-673c187f5d32'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/one-night-ultimate-werewolf.pdf', 'https://www.youtube.com/watch?v=7rwi40IG-_0'),  -- One Night Ultimate Werewolf
  ('121b6f77-00ac-4892-926a-0f9f80b66784'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/poklon-the-gift.pdf', 'https://www.youtube.com/watch?v=Jr9DwOuF_Yk'),  -- Poklon (The Gift)
  ('a9297946-3704-4f32-80ea-f13a532ffdbd'::uuid, 'https://gamerules.com/rules/harmonies/', 'https://www.youtube.com/watch?v=NlygiFc_xNY'),  -- Priroda
  ('5b445b1c-e772-4c41-90ac-e4b4e6bee032'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/ra.pdf', 'https://www.youtube.com/watch?v=HubpjBwlbZ4'),  -- Ra
  ('de01b2ee-8e96-4538-bbf8-7437f7428024'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/rat-u-zemlji-cuda-wonderland-s-war.pdf', 'https://www.youtube.com/watch?v=InFCPUb2-vQ'),  -- Rat u zemlji čuda (Wonderland's War)
  ('5d517217-c82f-4123-ad67-08d9177350e0'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/rebirth.pdf', 'https://www.youtube.com/watch?v=gymWKuwsfp4'),  -- Rebirth
  ('971eee65-d090-4429-a8d1-814bd4e69c29'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/serif-sheriff-of-nottingham.pdf', 'https://www.youtube.com/watch?v=He8wKTnWeaE'),  -- Serif od Notingema 2nd
  ('9dde51b1-e34f-4ba3-b5cd-a3d4363577b0'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/seti-seti.pdf', 'https://www.youtube.com/watch?v=dHUqPmrXuJY'),  -- Seti (SETI)
  ('6824d23b-70e3-4c76-a577-fdf3c0c40713'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/splendor.pdf', 'https://www.youtube.com/watch?v=AvQ1_McqT3A'),  -- Splendor
  ('5b7a00ba-83ee-49df-be9d-d6af3ebc982d'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/tapestry.pdf', 'https://www.youtube.com/watch?v=J-O5ebm5Ea4'),  -- Tapestry
  ('cba8aab0-985f-4d09-9513-46032b69d95f'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/mars-terraforming-mars.pdf', 'https://www.youtube.com/watch?v=B1j-mBcHnJQ'),  -- Teraformiranje  Mars
  ('f8bf7c24-4ac8-4fb5-a649-ec0c448e6c1c'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/that-s-not-a-hat.pdf', 'https://www.youtube.com/watch?v=uAC91HVUxJo'),  -- That's Not a Hat
  ('f3758dfd-0ec7-43c9-8dab-ced30b3ded3e'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/vinhos.pdf', 'https://www.youtube.com/watch?v=VoX0FLDtPBM'),  -- Vinhos (Deluxe edition)
  ('079cf32d-6673-4eb5-9e6d-97c29e166975'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/wingspan.pdf', 'https://www.youtube.com/watch?v=54Z83jBDCDI'),  -- Wingspan
  ('a38f5b55-be57-411a-8700-f244504e595c'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/wispwood.pdf', 'https://www.youtube.com/watch?v=H3kYeZBc-NQ'),  -- Wispwood
  ('81c38749-a711-41b6-9c0a-27f7cede9109'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/world-order.pdf', 'https://www.youtube.com/watch?v=HkVjCpd_9G0'),  -- World Order
  ('ae80d563-a504-426d-87d0-0807d676b5c6'::uuid, 'https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/zamak-combo-castle-combo.pdf', 'https://www.youtube.com/watch?v=UGex4EbL-tE')  -- Zamak Combo (Castle Combo)
) as l(id, pdf, yt)
where g.id = l.id;

select count(*) filter (where rules_pdf_url like '%/storage/v1/object/public/rules/%') as pravila_u_storage,
       count(*) filter (where youtube_url is not null) as sa_videom,
       count(*) as ukupno_igara
from public.games;

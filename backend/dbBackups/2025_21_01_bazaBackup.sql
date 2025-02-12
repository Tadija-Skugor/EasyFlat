PGDMP  0                     }            EzFlat    16.2    16.2 ;    
           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false                       1262    25754    EzFlat    DATABASE     ~   CREATE DATABASE "EzFlat" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Croatian_Croatia.1250';
    DROP DATABASE "EzFlat";
                postgres    false                        2615    2200    public    SCHEMA        CREATE SCHEMA public;
    DROP SCHEMA public;
                pg_database_owner    false                       0    0    SCHEMA public    COMMENT     6   COMMENT ON SCHEMA public IS 'standard public schema';
                   pg_database_owner    false    4            �            1255    25755    find_next_identity_diskusija()    FUNCTION     =  CREATE FUNCTION public.find_next_identity_diskusija() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    LOOP
        -- Try the next available ID
        IF NOT EXISTS (SELECT 1 FROM diskusija WHERE id = NEW.id) THEN
            RETURN NEW;
        END IF;
        NEW.id := NEW.id + 1;
    END LOOP;
END;
$$;
 5   DROP FUNCTION public.find_next_identity_diskusija();
       public          postgres    false    4            �            1255    25756 #   find_next_identity_glasanje_forma()    FUNCTION     G  CREATE FUNCTION public.find_next_identity_glasanje_forma() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    LOOP
        -- Try the next available ID
        IF NOT EXISTS (SELECT 1 FROM glasanje_forma WHERE id = NEW.id) THEN
            RETURN NEW;
        END IF;
        NEW.id := NEW.id + 1;
    END LOOP;
END;
$$;
 :   DROP FUNCTION public.find_next_identity_glasanje_forma();
       public          postgres    false    4            �            1255    25854    handle_glasanje_update()    FUNCTION     �  CREATE FUNCTION public.handle_glasanje_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  korisnik_count INT;
BEGIN
  -- First, check if the updated "id" exists in the "id_forme" column of the "diskusija" table
  IF EXISTS (
    SELECT 1
    FROM diskusija
    WHERE id_forme = NEW.id
  ) THEN
    -- Count the number of rows in "korisnik" that match the "zgrada_id" of the updated row
    SELECT COUNT(*)
    INTO korisnik_count
    FROM korisnik
    WHERE zgrada_id = NEW.zgrada_id;

    -- Check if the combined numbers from "glasovanje_da" and "glasovanje_ne" meet the condition
    IF (NEW.glasovanje_da + NEW.glasovanje_ne) >= korisnik_count THEN
      -- Insert a row into the "sastanak" table with the "id" from the matching "diskusija" row
      INSERT INTO sastanak (id_diskusije)
      SELECT id
      FROM diskusija
      WHERE id_forme = NEW.id;
    END IF;
  END IF;

  -- Return the NEW row to allow the update to proceed
  RETURN NEW;
END;
$$;
 /   DROP FUNCTION public.handle_glasanje_update();
       public          postgres    false    4            �            1255    25757    mark_stan_as_zauzet()    FUNCTION     �   CREATE FUNCTION public.mark_stan_as_zauzet() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Update the 'zauzet' column in the 'stan' table to true
    UPDATE stan SET zauzet = TRUE WHERE stan_id = NEW.stan_id;
    RETURN NEW;
END;
$$;
 ,   DROP FUNCTION public.mark_stan_as_zauzet();
       public          postgres    false    4            �            1255    25758    unmark_stan_as_zauzet()    FUNCTION       CREATE FUNCTION public.unmark_stan_as_zauzet() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Set 'zauzet' to FALSE in the 'stan' table when a related 'korisnik' row is deleted
    UPDATE stan SET zauzet = FALSE WHERE stan_id = OLD.stan_id;
    RETURN OLD;
END;
$$;
 .   DROP FUNCTION public.unmark_stan_as_zauzet();
       public          postgres    false    4            �            1259    25759    arhiva    TABLE     .  CREATE TABLE public.arhiva (
    id integer NOT NULL,
    naslov character varying(50) NOT NULL,
    opis text,
    kreator character varying(50) NOT NULL,
    datum_stvorena date NOT NULL,
    odgovori text,
    naslov_glasanja character varying(50),
    glasovi_da integer,
    glasovi_ne integer
);
    DROP TABLE public.arhiva;
       public         heap    postgres    false    4            �            1259    25764 	   diskusija    TABLE     r  CREATE TABLE public.diskusija (
    id integer NOT NULL,
    naslov character varying(50) NOT NULL,
    opis text,
    kreator character varying(50) NOT NULL,
    datum_stvorena date DEFAULT CURRENT_DATE NOT NULL,
    zadnji_pristup date DEFAULT CURRENT_DATE NOT NULL,
    br_odgovora integer DEFAULT 0,
    odgovori text,
    id_forme integer,
    zgrada_id integer
);
    DROP TABLE public.diskusija;
       public         heap    postgres    false    4            �            1259    25772    diskusija_id_seq    SEQUENCE     �   ALTER TABLE public.diskusija ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.diskusija_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 1000000
    CACHE 1
    CYCLE
);
            public          postgres    false    4    216            �            1259    25773    glasanje    TABLE     �   CREATE TABLE public.glasanje (
    id_forme integer NOT NULL,
    mail_glasaca character varying(50) NOT NULL,
    odgovor boolean NOT NULL
);
    DROP TABLE public.glasanje;
       public         heap    postgres    false    4            �            1259    25776    glasanje_forma    TABLE     ,  CREATE TABLE public.glasanje_forma (
    id integer NOT NULL,
    datum_stvoreno date DEFAULT CURRENT_DATE NOT NULL,
    datum_istece date,
    glasovanje_da integer DEFAULT 0,
    glasovanje_ne integer DEFAULT 0,
    naslov character varying(50) NOT NULL,
    kreator text,
    zgrada_id integer
);
 "   DROP TABLE public.glasanje_forma;
       public         heap    postgres    false    4            �            1259    25784    glasanje_forma_id_seq    SEQUENCE     �   CREATE SEQUENCE public.glasanje_forma_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.glasanje_forma_id_seq;
       public          postgres    false    219    4                       0    0    glasanje_forma_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.glasanje_forma_id_seq OWNED BY public.glasanje_forma.id;
          public          postgres    false    220            �            1259    25785    glasanje_forma_id_seq1    SEQUENCE     �   ALTER TABLE public.glasanje_forma ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.glasanje_forma_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 1000000
    CACHE 1
    CYCLE
);
            public          postgres    false    219    4            �            1259    25786    korisnik    TABLE     :  CREATE TABLE public.korisnik (
    ime character varying(20) NOT NULL,
    prezime character varying(20) NOT NULL,
    lozinka character varying(60) NOT NULL,
    email character varying(50) NOT NULL,
    stan_id integer NOT NULL,
    aktivan boolean DEFAULT false,
    zgrada_id integer,
    suvlasnik boolean
);
    DROP TABLE public.korisnik;
       public         heap    postgres    false    4            �            1259    25790    nema_pristup_diskusiji    TABLE     �   CREATE TABLE public.nema_pristup_diskusiji (
    diskusija_id integer NOT NULL,
    korisnik_id character varying(50) NOT NULL
);
 *   DROP TABLE public.nema_pristup_diskusiji;
       public         heap    postgres    false    4            �            1259    25848    sastanak    TABLE     �   CREATE TABLE public.sastanak (
    id_diskusije integer NOT NULL,
    link character varying(100) DEFAULT 'create'::character varying NOT NULL
);
    DROP TABLE public.sastanak;
       public         heap    postgres    false    4            �            1259    25793    stan    TABLE     \   CREATE TABLE public.stan (
    stan_id integer NOT NULL,
    zauzet boolean DEFAULT true
);
    DROP TABLE public.stan;
       public         heap    postgres    false    4            �            1259    25797    upit    TABLE     �   CREATE TABLE public.upit (
    emailosobe character varying(50),
    tekst character varying(500),
    rjeseno boolean DEFAULT false,
    zgrada_id integer
);
    DROP TABLE public.upit;
       public         heap    postgres    false    4            �            1259    25803    zgrade    TABLE        CREATE TABLE public.zgrade (
    id integer NOT NULL,
    naziv_zgrade character varying(255) NOT NULL,
    slika_link text
);
    DROP TABLE public.zgrade;
       public         heap    postgres    false    4            �            1259    25808    zgrade_id_seq    SEQUENCE     �   CREATE SEQUENCE public.zgrade_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.zgrade_id_seq;
       public          postgres    false    226    4                       0    0    zgrade_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.zgrade_id_seq OWNED BY public.zgrade.id;
          public          postgres    false    227            O           2604    25809 	   zgrade id    DEFAULT     f   ALTER TABLE ONLY public.zgrade ALTER COLUMN id SET DEFAULT nextval('public.zgrade_id_seq'::regclass);
 8   ALTER TABLE public.zgrade ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    227    226            �          0    25759    arhiva 
   TABLE DATA           ~   COPY public.arhiva (id, naslov, opis, kreator, datum_stvorena, odgovori, naslov_glasanja, glasovi_da, glasovi_ne) FROM stdin;
    public          postgres    false    215   �K       �          0    25764 	   diskusija 
   TABLE DATA           �   COPY public.diskusija (id, naslov, opis, kreator, datum_stvorena, zadnji_pristup, br_odgovora, odgovori, id_forme, zgrada_id) FROM stdin;
    public          postgres    false    216   }L       �          0    25773    glasanje 
   TABLE DATA           C   COPY public.glasanje (id_forme, mail_glasaca, odgovor) FROM stdin;
    public          postgres    false    218   �N       �          0    25776    glasanje_forma 
   TABLE DATA           �   COPY public.glasanje_forma (id, datum_stvoreno, datum_istece, glasovanje_da, glasovanje_ne, naslov, kreator, zgrada_id) FROM stdin;
    public          postgres    false    219   BO                 0    25786    korisnik 
   TABLE DATA           h   COPY public.korisnik (ime, prezime, lozinka, email, stan_id, aktivan, zgrada_id, suvlasnik) FROM stdin;
    public          postgres    false    222   .Q                 0    25790    nema_pristup_diskusiji 
   TABLE DATA           K   COPY public.nema_pristup_diskusiji (diskusija_id, korisnik_id) FROM stdin;
    public          postgres    false    223   �Q                 0    25848    sastanak 
   TABLE DATA           6   COPY public.sastanak (id_diskusije, link) FROM stdin;
    public          postgres    false    228   �Q                 0    25793    stan 
   TABLE DATA           /   COPY public.stan (stan_id, zauzet) FROM stdin;
    public          postgres    false    224   "R                 0    25797    upit 
   TABLE DATA           E   COPY public.upit (emailosobe, tekst, rjeseno, zgrada_id) FROM stdin;
    public          postgres    false    225   SR                 0    25803    zgrade 
   TABLE DATA           >   COPY public.zgrade (id, naziv_zgrade, slika_link) FROM stdin;
    public          postgres    false    226   �R                  0    0    diskusija_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.diskusija_id_seq', 119, true);
          public          postgres    false    217                       0    0    glasanje_forma_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.glasanje_forma_id_seq', 11, true);
          public          postgres    false    220                       0    0    glasanje_forma_id_seq1    SEQUENCE SET     E   SELECT pg_catalog.setval('public.glasanje_forma_id_seq1', 24, true);
          public          postgres    false    221                       0    0    zgrade_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.zgrade_id_seq', 2, true);
          public          postgres    false    227            R           2606    25811    arhiva arhiva_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.arhiva
    ADD CONSTRAINT arhiva_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.arhiva DROP CONSTRAINT arhiva_pkey;
       public            postgres    false    215            T           2606    25813    diskusija diskusija_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.diskusija
    ADD CONSTRAINT diskusija_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.diskusija DROP CONSTRAINT diskusija_pkey;
       public            postgres    false    216            X           2606    25815 "   glasanje_forma glasanje_forma_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.glasanje_forma
    ADD CONSTRAINT glasanje_forma_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.glasanje_forma DROP CONSTRAINT glasanje_forma_pkey;
       public            postgres    false    219            V           2606    25817    glasanje glasanje_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public.glasanje
    ADD CONSTRAINT glasanje_pkey PRIMARY KEY (id_forme, mail_glasaca);
 @   ALTER TABLE ONLY public.glasanje DROP CONSTRAINT glasanje_pkey;
       public            postgres    false    218    218            Z           2606    25819    korisnik korisnik_email_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.korisnik
    ADD CONSTRAINT korisnik_email_key UNIQUE (email);
 E   ALTER TABLE ONLY public.korisnik DROP CONSTRAINT korisnik_email_key;
       public            postgres    false    222            \           2606    25821    korisnik korisnik_pkey 
   CONSTRAINT     W   ALTER TABLE ONLY public.korisnik
    ADD CONSTRAINT korisnik_pkey PRIMARY KEY (email);
 @   ALTER TABLE ONLY public.korisnik DROP CONSTRAINT korisnik_pkey;
       public            postgres    false    222            b           2606    25853    sastanak sastanak_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.sastanak
    ADD CONSTRAINT sastanak_pkey PRIMARY KEY (id_diskusije);
 @   ALTER TABLE ONLY public.sastanak DROP CONSTRAINT sastanak_pkey;
       public            postgres    false    228            ^           2606    25823    stan stan_pkey 
   CONSTRAINT     Q   ALTER TABLE ONLY public.stan
    ADD CONSTRAINT stan_pkey PRIMARY KEY (stan_id);
 8   ALTER TABLE ONLY public.stan DROP CONSTRAINT stan_pkey;
       public            postgres    false    224            `           2606    25825    zgrade zgrade_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.zgrade
    ADD CONSTRAINT zgrade_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.zgrade DROP CONSTRAINT zgrade_pkey;
       public            postgres    false    226            g           2620    25855 $   glasanje_forma after_glasanje_update    TRIGGER     �   CREATE TRIGGER after_glasanje_update AFTER UPDATE ON public.glasanje_forma FOR EACH ROW EXECUTE FUNCTION public.handle_glasanje_update();
 =   DROP TRIGGER after_glasanje_update ON public.glasanje_forma;
       public          postgres    false    219    233            i           2620    25826    korisnik after_korisnik_delete    TRIGGER     �   CREATE TRIGGER after_korisnik_delete AFTER DELETE ON public.korisnik FOR EACH ROW EXECUTE FUNCTION public.unmark_stan_as_zauzet();
 7   DROP TRIGGER after_korisnik_delete ON public.korisnik;
       public          postgres    false    232    222            j           2620    25827    korisnik after_korisnik_insert    TRIGGER     �   CREATE TRIGGER after_korisnik_insert AFTER INSERT ON public.korisnik FOR EACH ROW EXECUTE FUNCTION public.mark_stan_as_zauzet();
 7   DROP TRIGGER after_korisnik_insert ON public.korisnik;
       public          postgres    false    231    222            f           2620    25828 )   diskusija next_identity_diskusija_trigger    TRIGGER     �   CREATE TRIGGER next_identity_diskusija_trigger BEFORE INSERT ON public.diskusija FOR EACH ROW EXECUTE FUNCTION public.find_next_identity_diskusija();
 B   DROP TRIGGER next_identity_diskusija_trigger ON public.diskusija;
       public          postgres    false    229    216            h           2620    25829 $   glasanje_forma next_identity_trigger    TRIGGER     �   CREATE TRIGGER next_identity_trigger BEFORE INSERT ON public.glasanje_forma FOR EACH ROW EXECUTE FUNCTION public.find_next_identity_glasanje_forma();
 =   DROP TRIGGER next_identity_trigger ON public.glasanje_forma;
       public          postgres    false    230    219            d           2606    25830    korisnik fk_korisnik_zgrada    FK CONSTRAINT     �   ALTER TABLE ONLY public.korisnik
    ADD CONSTRAINT fk_korisnik_zgrada FOREIGN KEY (zgrada_id) REFERENCES public.zgrade(id) ON DELETE SET NULL;
 E   ALTER TABLE ONLY public.korisnik DROP CONSTRAINT fk_korisnik_zgrada;
       public          postgres    false    4704    222    226            c           2606    25835    glasanje glasanje_id_forme_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.glasanje
    ADD CONSTRAINT glasanje_id_forme_fkey FOREIGN KEY (id_forme) REFERENCES public.glasanje_forma(id);
 I   ALTER TABLE ONLY public.glasanje DROP CONSTRAINT glasanje_id_forme_fkey;
       public          postgres    false    218    219    4696            e           2606    25840 >   nema_pristup_diskusiji nema_pristup_diskusiji_korisnik_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.nema_pristup_diskusiji
    ADD CONSTRAINT nema_pristup_diskusiji_korisnik_id_fkey FOREIGN KEY (korisnik_id) REFERENCES public.korisnik(email);
 h   ALTER TABLE ONLY public.nema_pristup_diskusiji DROP CONSTRAINT nema_pristup_diskusiji_korisnik_id_fkey;
       public          postgres    false    223    222    4698            �   �   x�mͱ� ��x
^�(������<�%P��}{�88������sN���Ly�����U��)��$OQ���j�cm��	��p�/b��S�(�ȡRi=��ߢo�����UE.ye����>'f%�x'T6i      �   4  x��WKo�0>��?������e���a���\\pS��C���_SH�4uJ�h?q�χ���Ě��y�5��=jQg`����h#e�X����\`*�E����ER�(x��Y��1wT�֩;ڱ]J��������z��+3�_"%oۊXV�W�R� ;�q��:t���Q�Ԥ��3|�ݲ"��F|�$Ll��LJ����_�(X����<'�6m�B������+q�Y!se���=o�ѥ���T�!2��!��G���~��~��~�d5���}0��B�u��X�^ł�<��R�~���w�@'��\�5��'�c��Q9�!QqZ���B�3X����u��n�v�@:��R
q'��⑉вϦ��$(7A�g���lX�m��s�d��,��¤=8k:L��?N+����#�m#�a.�B	�j��5�����Z܃�v�r��Ph����C�kg�ԡӘפLk�U�P_j�T��O�i����갈������S=�����T�&e�n1ݞ�Ȟ%�ú�T]����A��      �   q   x���K
�0��aJ?J�΃�	�i-H��ڝB�ۙ������Ҏ���S3�iM��D�}i+2N��k8̥�3h�{�����q�w׾�r)]���=��| .��d      �   �  x��TKn�0]�N���%�^H�-R�򆮅T���dh.�Uѻ���v�q*��=ΛG-��T#j��%B
ߖ�-�E�W^��?���E�>���UN͊�<���!��D�h�8�!Mȃ�ѭʵ�삣�����s�N5��ߩ�{�;x,�]Y갗j"u�Tֳ*�͡	�鶜����L1�;Fc9X���ڵn���)��a��'_�n�鍉�L<��Zml ��pt,q)�6aF\*p|���8L��1�3��t��j3:/)Tt��'w��D��E��,��1$zԇfmawK(+C��3m���-��W�¶A��f��(@�E����+�Z5�]�k�u�oB���+�| ؎��m�MI��;'�G�:L˚��ߗՓ��z�/!`Bh�������_��x����<�?��bl���~ں�U�1I�&2�%���{3ߺv�.�4�pK�;�ER�舠R8�$I���         �   x�K�4�4�4�? �J�4CC�HHbJfV"��٥��E�%��%�%`1sS��������\NC#��9@�Y�e%����P~RbRbV~:�##c�C�%����E�>�e��Gڡ�@�r@���HZMLa:c���� ��;�            x������ � �         ,   x�34���())(���/(���J-����N�/NIK�a�=... A�%         !   x�32�L�a# 6bD�� "F��� �|�         r   x�+IL�,I�..�L���*IL��J47uH�M���K���L)N$K.�?(��Q!�58��8%��8�,�`bb"gJJ
��皝���X��_�Y�_T�U��@ �q��qqq #7         %   x�3�J/JLITp�����6�2�	8���b���� �_
x     
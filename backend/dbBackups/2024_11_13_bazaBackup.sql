PGDMP  -                
    |            EasyFlatBaza    16.2    16.2 ,               0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false                       1262    41524    EasyFlatBaza    DATABASE     �   CREATE DATABASE "EasyFlatBaza" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Croatian_Croatia.1250';
    DROP DATABASE "EasyFlatBaza";
                postgres    false                        2615    41568    public    SCHEMA     2   -- *not* creating schema, since initdb creates it
 2   -- *not* dropping schema, since initdb creates it
                postgres    false                        0    0    SCHEMA public    COMMENT         COMMENT ON SCHEMA public IS '';
                   postgres    false    5            !           0    0    SCHEMA public    ACL     +   REVOKE USAGE ON SCHEMA public FROM PUBLIC;
                   postgres    false    5            �            1255    41569    mark_stan_as_zauzet()    FUNCTION     �   CREATE FUNCTION public.mark_stan_as_zauzet() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Update the 'zauzet' column in the 'stan' table to true
    UPDATE stan SET zauzet = TRUE WHERE stan_id = NEW.stan_id;
    RETURN NEW;
END;
$$;
 ,   DROP FUNCTION public.mark_stan_as_zauzet();
       public          postgres    false    5            �            1255    41570    unmark_stan_as_zauzet()    FUNCTION       CREATE FUNCTION public.unmark_stan_as_zauzet() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Set 'zauzet' to FALSE in the 'stan' table when a related 'korisnik' row is deleted
    UPDATE stan SET zauzet = FALSE WHERE stan_id = OLD.stan_id;
    RETURN OLD;
END;
$$;
 .   DROP FUNCTION public.unmark_stan_as_zauzet();
       public          postgres    false    5            �            1259    41571 	   diskusija    TABLE       CREATE TABLE public.diskusija (
    id integer NOT NULL,
    naslov character varying(50) NOT NULL,
    odgovori text NOT NULL,
    kreator integer,
    datum date DEFAULT CURRENT_DATE NOT NULL,
    br_odgovora integer,
    opis text,
    id_forme integer
);
    DROP TABLE public.diskusija;
       public         heap    postgres    false    5            �            1259    41577    diskusija_id_seq    SEQUENCE     �   CREATE SEQUENCE public.diskusija_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.diskusija_id_seq;
       public          postgres    false    215    5            "           0    0    diskusija_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.diskusija_id_seq OWNED BY public.diskusija.id;
          public          postgres    false    216            �            1259    41647    glasanje    TABLE       CREATE TABLE public.glasanje (
    id integer NOT NULL,
    id_forme integer,
    mail_glasaca text NOT NULL,
    odgovor character varying(3),
    CONSTRAINT glasanje_odgovor_check CHECK (((odgovor)::text = ANY ((ARRAY['yes'::character varying, 'no'::character varying])::text[])))
);
    DROP TABLE public.glasanje;
       public         heap    postgres    false    5            �            1259    41636    glasanje_forma    TABLE     &  CREATE TABLE public.glasanje_forma (
    id integer NOT NULL,
    datum_stvoreno timestamp without time zone NOT NULL,
    datum_isteko timestamp without time zone NOT NULL,
    glasovanje_da integer DEFAULT 0,
    glasovanje_ne integer DEFAULT 0,
    naslov text NOT NULL,
    kreator text
);
 "   DROP TABLE public.glasanje_forma;
       public         heap    postgres    false    5            �            1259    41635    glasanje_forma_id_seq    SEQUENCE     �   CREATE SEQUENCE public.glasanje_forma_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.glasanje_forma_id_seq;
       public          postgres    false    5    221            #           0    0    glasanje_forma_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.glasanje_forma_id_seq OWNED BY public.glasanje_forma.id;
          public          postgres    false    220            �            1259    41646    glasanje_id_seq    SEQUENCE     �   CREATE SEQUENCE public.glasanje_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.glasanje_id_seq;
       public          postgres    false    5    223            $           0    0    glasanje_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.glasanje_id_seq OWNED BY public.glasanje.id;
          public          postgres    false    222            �            1259    41590    korisnik    TABLE       CREATE TABLE public.korisnik (
    ime character varying(20) NOT NULL,
    prezime character varying(20) NOT NULL,
    lozinka character varying(60) NOT NULL,
    email character varying(50) NOT NULL,
    stan_id integer NOT NULL,
    aktivan boolean DEFAULT false
);
    DROP TABLE public.korisnik;
       public         heap    postgres    false    5            �            1259    41594    nema_pristup_diskusiji    TABLE     p   CREATE TABLE public.nema_pristup_diskusiji (
    diskusija_id integer,
    korisnik_id character varying(50)
);
 *   DROP TABLE public.nema_pristup_diskusiji;
       public         heap    postgres    false    5            �            1259    41597    stan    TABLE     \   CREATE TABLE public.stan (
    stan_id integer NOT NULL,
    zauzet boolean DEFAULT true
);
    DROP TABLE public.stan;
       public         heap    postgres    false    5            h           2604    41601    diskusija id    DEFAULT     l   ALTER TABLE ONLY public.diskusija ALTER COLUMN id SET DEFAULT nextval('public.diskusija_id_seq'::regclass);
 ;   ALTER TABLE public.diskusija ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    216    215            o           2604    41650    glasanje id    DEFAULT     j   ALTER TABLE ONLY public.glasanje ALTER COLUMN id SET DEFAULT nextval('public.glasanje_id_seq'::regclass);
 :   ALTER TABLE public.glasanje ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    223    222    223            l           2604    41639    glasanje_forma id    DEFAULT     v   ALTER TABLE ONLY public.glasanje_forma ALTER COLUMN id SET DEFAULT nextval('public.glasanje_forma_id_seq'::regclass);
 @   ALTER TABLE public.glasanje_forma ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    221    220    221                      0    41571 	   diskusija 
   TABLE DATA           f   COPY public.diskusija (id, naslov, odgovori, kreator, datum, br_odgovora, opis, id_forme) FROM stdin;
    public          postgres    false    215   �3                 0    41647    glasanje 
   TABLE DATA           G   COPY public.glasanje (id, id_forme, mail_glasaca, odgovor) FROM stdin;
    public          postgres    false    223   4                 0    41636    glasanje_forma 
   TABLE DATA           y   COPY public.glasanje_forma (id, datum_stvoreno, datum_isteko, glasovanje_da, glasovanje_ne, naslov, kreator) FROM stdin;
    public          postgres    false    221   �4                 0    41590    korisnik 
   TABLE DATA           R   COPY public.korisnik (ime, prezime, lozinka, email, stan_id, aktivan) FROM stdin;
    public          postgres    false    217   Q5                 0    41594    nema_pristup_diskusiji 
   TABLE DATA           K   COPY public.nema_pristup_diskusiji (diskusija_id, korisnik_id) FROM stdin;
    public          postgres    false    218   6                 0    41597    stan 
   TABLE DATA           /   COPY public.stan (stan_id, zauzet) FROM stdin;
    public          postgres    false    219   $6       %           0    0    diskusija_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.diskusija_id_seq', 1, false);
          public          postgres    false    216            &           0    0    glasanje_forma_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.glasanje_forma_id_seq', 3, true);
          public          postgres    false    220            '           0    0    glasanje_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.glasanje_id_seq', 21, true);
          public          postgres    false    222            r           2606    41604    diskusija diskusija_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.diskusija
    ADD CONSTRAINT diskusija_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.diskusija DROP CONSTRAINT diskusija_pkey;
       public            postgres    false    215            z           2606    41645 "   glasanje_forma glasanje_forma_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.glasanje_forma
    ADD CONSTRAINT glasanje_forma_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.glasanje_forma DROP CONSTRAINT glasanje_forma_pkey;
       public            postgres    false    221            |           2606    41655    glasanje glasanje_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.glasanje
    ADD CONSTRAINT glasanje_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.glasanje DROP CONSTRAINT glasanje_pkey;
       public            postgres    false    223            t           2606    41608    korisnik korisnik_email_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.korisnik
    ADD CONSTRAINT korisnik_email_key UNIQUE (email);
 E   ALTER TABLE ONLY public.korisnik DROP CONSTRAINT korisnik_email_key;
       public            postgres    false    217            v           2606    41610    korisnik korisnik_pkey 
   CONSTRAINT     W   ALTER TABLE ONLY public.korisnik
    ADD CONSTRAINT korisnik_pkey PRIMARY KEY (email);
 @   ALTER TABLE ONLY public.korisnik DROP CONSTRAINT korisnik_pkey;
       public            postgres    false    217            x           2606    41612    stan stan_pkey 
   CONSTRAINT     Q   ALTER TABLE ONLY public.stan
    ADD CONSTRAINT stan_pkey PRIMARY KEY (stan_id);
 8   ALTER TABLE ONLY public.stan DROP CONSTRAINT stan_pkey;
       public            postgres    false    219            �           2620    41613    korisnik after_korisnik_delete    TRIGGER     �   CREATE TRIGGER after_korisnik_delete AFTER DELETE ON public.korisnik FOR EACH ROW EXECUTE FUNCTION public.unmark_stan_as_zauzet();
 7   DROP TRIGGER after_korisnik_delete ON public.korisnik;
       public          postgres    false    217    225            �           2620    41614    korisnik after_korisnik_insert    TRIGGER     �   CREATE TRIGGER after_korisnik_insert AFTER INSERT ON public.korisnik FOR EACH ROW EXECUTE FUNCTION public.mark_stan_as_zauzet();
 7   DROP TRIGGER after_korisnik_insert ON public.korisnik;
       public          postgres    false    224    217                       2606    41656    glasanje glasanje_id_forme_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.glasanje
    ADD CONSTRAINT glasanje_id_forme_fkey FOREIGN KEY (id_forme) REFERENCES public.glasanje_forma(id);
 I   ALTER TABLE ONLY public.glasanje DROP CONSTRAINT glasanje_id_forme_fkey;
       public          postgres    false    223    4730    221            }           2606    41625 ?   nema_pristup_diskusiji nema_pristup_diskusiji_diskusija_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.nema_pristup_diskusiji
    ADD CONSTRAINT nema_pristup_diskusiji_diskusija_id_fkey FOREIGN KEY (diskusija_id) REFERENCES public.diskusija(id);
 i   ALTER TABLE ONLY public.nema_pristup_diskusiji DROP CONSTRAINT nema_pristup_diskusiji_diskusija_id_fkey;
       public          postgres    false    4722    215    218            ~           2606    41630 >   nema_pristup_diskusiji nema_pristup_diskusiji_korisnik_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.nema_pristup_diskusiji
    ADD CONSTRAINT nema_pristup_diskusiji_korisnik_id_fkey FOREIGN KEY (korisnik_id) REFERENCES public.korisnik(email);
 h   ALTER TABLE ONLY public.nema_pristup_diskusiji DROP CONSTRAINT nema_pristup_diskusiji_korisnik_id_fkey;
       public          postgres    false    218    4724    217                  x������ � �         �   x�}�K�0D��a��Qw�Y!� ��Ǭ�*-[�y3�~Hu1eZ�(L����<c%�FRC�d����
\>��əB�B��\��t�3�»KoDxH߯�~
���./-��G��@�޸��yB��i�q�dM         �   x�]�M
�P�����n@����Κ	M�\����o�\D{y�+��
8�}�4�8`��)�%��	u�%��@ùWV�ޣE?�χM[pp�
�+����Ӣ�폒NVe��u��b.�����I��
R�'�_�4�pi�5�A�	�B�͇�։��5TJ� ��:X         �   x�M�1�0���i$����$&..�Rh��Z�����|������OCP>@��Lx���Xٓ��� 4��Y��;�Hv���y���E;��N��H&��|�Է2�JCʢ��3���Cv>^>X���f�*Hbe_�	^�����!�uW��#�Ŭ\�            x������ � �         %   x�32�,�2�L�2�F� ��32� ����� �]�     
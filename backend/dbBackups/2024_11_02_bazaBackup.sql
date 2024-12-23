PGDMP  $                
    |            EasyFlat    16.2    16.2 (    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    16562    EasyFlat    DATABASE     �   CREATE DATABASE "EasyFlat" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Croatian_Croatia.1250';
    DROP DATABASE "EasyFlat";
                postgres    false                        2615    16595    public    SCHEMA        CREATE SCHEMA public;
    DROP SCHEMA public;
                pg_database_owner    false            �           0    0    SCHEMA public    COMMENT     6   COMMENT ON SCHEMA public IS 'standard public schema';
                   pg_database_owner    false    5            �           0    0    SCHEMA public    ACL     +   REVOKE USAGE ON SCHEMA public FROM PUBLIC;
                   pg_database_owner    false    5            �            1255    16596    mark_stan_as_zauzet()    FUNCTION     �   CREATE FUNCTION public.mark_stan_as_zauzet() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Update the 'zauzet' column in the 'stan' table to true
    UPDATE stan SET zauzet = TRUE WHERE stan_id = NEW.stan_id;
    RETURN NEW;
END;
$$;
 ,   DROP FUNCTION public.mark_stan_as_zauzet();
       public          postgres    false    5            �            1255    16597    unmark_stan_as_zauzet()    FUNCTION       CREATE FUNCTION public.unmark_stan_as_zauzet() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Set 'zauzet' to FALSE in the 'stan' table when a related 'korisnik' row is deleted
    UPDATE stan SET zauzet = FALSE WHERE stan_id = OLD.stan_id;
    RETURN OLD;
END;
$$;
 .   DROP FUNCTION public.unmark_stan_as_zauzet();
       public          postgres    false    5            �            1259    16598 	   diskusija    TABLE       CREATE TABLE public.diskusija (
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
       public         heap    postgres    false    5            �            1259    16603    diskusija_id_seq    SEQUENCE     �   CREATE SEQUENCE public.diskusija_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.diskusija_id_seq;
       public          postgres    false    215    5            �           0    0    diskusija_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.diskusija_id_seq OWNED BY public.diskusija.id;
          public          postgres    false    216            �            1259    16658    glasanje    TABLE     t   CREATE TABLE public.glasanje (
    id_forme integer,
    mail_glasaca character varying(50),
    odgovor boolean
);
    DROP TABLE public.glasanje;
       public         heap    postgres    false    5            �            1259    16645    glasanje_forma    TABLE     �   CREATE TABLE public.glasanje_forma (
    id integer NOT NULL,
    datum_stvoreno date DEFAULT CURRENT_DATE,
    datum_isteklo date,
    glasova_da integer DEFAULT 0,
    glasova_ne integer DEFAULT 0,
    naslov character varying
);
 "   DROP TABLE public.glasanje_forma;
       public         heap    postgres    false    5            �            1259    16644    glasanje_forma_id_seq    SEQUENCE     �   CREATE SEQUENCE public.glasanje_forma_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.glasanje_forma_id_seq;
       public          postgres    false    221    5            �           0    0    glasanje_forma_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.glasanje_forma_id_seq OWNED BY public.glasanje_forma.id;
          public          postgres    false    220            �            1259    16604    korisnik    TABLE       CREATE TABLE public.korisnik (
    ime character varying(20) NOT NULL,
    prezime character varying(20) NOT NULL,
    lozinka character varying(60) NOT NULL,
    email character varying(50) NOT NULL,
    stan_id integer NOT NULL,
    aktivan boolean DEFAULT false
);
    DROP TABLE public.korisnik;
       public         heap    postgres    false    5            �            1259    16631    nema_pristup_diskusiji    TABLE     p   CREATE TABLE public.nema_pristup_diskusiji (
    diskusija_id integer,
    korisnik_id character varying(50)
);
 *   DROP TABLE public.nema_pristup_diskusiji;
       public         heap    postgres    false    5            �            1259    16608    stan    TABLE     \   CREATE TABLE public.stan (
    stan_id integer NOT NULL,
    zauzet boolean DEFAULT true
);
    DROP TABLE public.stan;
       public         heap    postgres    false    5            1           2604    16612    diskusija id    DEFAULT     l   ALTER TABLE ONLY public.diskusija ALTER COLUMN id SET DEFAULT nextval('public.diskusija_id_seq'::regclass);
 ;   ALTER TABLE public.diskusija ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    216    215            5           2604    16648    glasanje_forma id    DEFAULT     v   ALTER TABLE ONLY public.glasanje_forma ALTER COLUMN id SET DEFAULT nextval('public.glasanje_forma_id_seq'::regclass);
 @   ALTER TABLE public.glasanje_forma ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    221    220    221            �          0    16598 	   diskusija 
   TABLE DATA           f   COPY public.diskusija (id, naslov, odgovori, kreator, datum, br_odgovora, opis, id_forme) FROM stdin;
    public          postgres    false    215   /       �          0    16658    glasanje 
   TABLE DATA           C   COPY public.glasanje (id_forme, mail_glasaca, odgovor) FROM stdin;
    public          postgres    false    222   !/       �          0    16645    glasanje_forma 
   TABLE DATA           k   COPY public.glasanje_forma (id, datum_stvoreno, datum_isteklo, glasova_da, glasova_ne, naslov) FROM stdin;
    public          postgres    false    221   >/       �          0    16604    korisnik 
   TABLE DATA           R   COPY public.korisnik (ime, prezime, lozinka, email, stan_id, aktivan) FROM stdin;
    public          postgres    false    217   [/       �          0    16631    nema_pristup_diskusiji 
   TABLE DATA           K   COPY public.nema_pristup_diskusiji (diskusija_id, korisnik_id) FROM stdin;
    public          postgres    false    219   �0       �          0    16608    stan 
   TABLE DATA           /   COPY public.stan (stan_id, zauzet) FROM stdin;
    public          postgres    false    218   �0       �           0    0    diskusija_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.diskusija_id_seq', 1, false);
          public          postgres    false    216            �           0    0    glasanje_forma_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.glasanje_forma_id_seq', 1, false);
          public          postgres    false    220            :           2606    16614    diskusija diskusija_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.diskusija
    ADD CONSTRAINT diskusija_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.diskusija DROP CONSTRAINT diskusija_pkey;
       public            postgres    false    215            B           2606    16652 "   glasanje_forma glasanje_forma_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.glasanje_forma
    ADD CONSTRAINT glasanje_forma_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.glasanje_forma DROP CONSTRAINT glasanje_forma_pkey;
       public            postgres    false    221            <           2606    16616    korisnik korisnik_email_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.korisnik
    ADD CONSTRAINT korisnik_email_key UNIQUE (email);
 E   ALTER TABLE ONLY public.korisnik DROP CONSTRAINT korisnik_email_key;
       public            postgres    false    217            >           2606    16630    korisnik korisnik_pkey 
   CONSTRAINT     W   ALTER TABLE ONLY public.korisnik
    ADD CONSTRAINT korisnik_pkey PRIMARY KEY (email);
 @   ALTER TABLE ONLY public.korisnik DROP CONSTRAINT korisnik_pkey;
       public            postgres    false    217            @           2606    16620    stan stan_pkey 
   CONSTRAINT     Q   ALTER TABLE ONLY public.stan
    ADD CONSTRAINT stan_pkey PRIMARY KEY (stan_id);
 8   ALTER TABLE ONLY public.stan DROP CONSTRAINT stan_pkey;
       public            postgres    false    218            G           2620    16621    korisnik after_korisnik_delete    TRIGGER     �   CREATE TRIGGER after_korisnik_delete AFTER DELETE ON public.korisnik FOR EACH ROW EXECUTE FUNCTION public.unmark_stan_as_zauzet();
 7   DROP TRIGGER after_korisnik_delete ON public.korisnik;
       public          postgres    false    224    217            H           2620    16622    korisnik after_korisnik_insert    TRIGGER     �   CREATE TRIGGER after_korisnik_insert AFTER INSERT ON public.korisnik FOR EACH ROW EXECUTE FUNCTION public.mark_stan_as_zauzet();
 7   DROP TRIGGER after_korisnik_insert ON public.korisnik;
       public          postgres    false    217    223            E           2606    16661    glasanje glasanje_id_forme_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.glasanje
    ADD CONSTRAINT glasanje_id_forme_fkey FOREIGN KEY (id_forme) REFERENCES public.glasanje_forma(id);
 I   ALTER TABLE ONLY public.glasanje DROP CONSTRAINT glasanje_id_forme_fkey;
       public          postgres    false    4674    222    221            F           2606    16666 "   glasanje glasanje_id_kreatora_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.glasanje
    ADD CONSTRAINT glasanje_id_kreatora_fkey FOREIGN KEY (mail_glasaca) REFERENCES public.korisnik(email);
 L   ALTER TABLE ONLY public.glasanje DROP CONSTRAINT glasanje_id_kreatora_fkey;
       public          postgres    false    222    4668    217            C           2606    16634 ?   nema_pristup_diskusiji nema_pristup_diskusiji_diskusija_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.nema_pristup_diskusiji
    ADD CONSTRAINT nema_pristup_diskusiji_diskusija_id_fkey FOREIGN KEY (diskusija_id) REFERENCES public.diskusija(id);
 i   ALTER TABLE ONLY public.nema_pristup_diskusiji DROP CONSTRAINT nema_pristup_diskusiji_diskusija_id_fkey;
       public          postgres    false    4666    219    215            D           2606    16639 >   nema_pristup_diskusiji nema_pristup_diskusiji_korisnik_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.nema_pristup_diskusiji
    ADD CONSTRAINT nema_pristup_diskusiji_korisnik_id_fkey FOREIGN KEY (korisnik_id) REFERENCES public.korisnik(email);
 h   ALTER TABLE ONLY public.nema_pristup_diskusiji DROP CONSTRAINT nema_pristup_diskusiji_korisnik_id_fkey;
       public          postgres    false    219    4668    217            �      x������ � �      �      x������ � �      �      x������ � �      �   n  x�u�AN�0Eד[p�$m��
+J[TQ���4��IG�!.��;�]ʽ;]4A�������Y�X���-Z(ջ�
��l��9CY���JB6��֨�����x�&�I{و���@X��._ҶFc���kV�Q:�bx6�j�K�9�v����N��}bD��E���� ��l�t�U��c�H6��aHoy�hz�j>�fB�Z���R�F�8v���0�P�%�R���Q�͆�N1Mv��hV��5hφ��['Y��>1#�NIaJl鷴��v�UrKS<sџiapx�h|9¶h2��rc�zk�Ie7�(�6m��>� �*��G��P'��|��>�D#7����xk^n��Dn~O,�_f-��      �      x������ � �      �   $   x�3�,�2bc 6bCm�e11z\\\ �]     
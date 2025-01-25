import { useParams } from "react-router-dom"
export default function KontaktDetalji(){
const params=useParams();
let detaljiKontakta =null;


//ovdje cemo implementirati bazu podataka za dobivanje brojeva ili svaceg neceg
if(params.broj==='999'){ //koristimo isto nazov kao iz Router  path="kontakt/:broj"
    detaljiKontakta={
        ime:'Administrator',
        broj: 385,
        slika:require('../assets/images/images.png')
    }
}
    return(
        <>
        <h1>Detalji kontakta</h1>
        <p>Broj zeljenog je: {params.broj}</p>

        {
            detaljiKontakta != null ?
            <>
                <img src={detaljiKontakta.slika} alt={detaljiKontakta.ime} width={400}/>
                <h2>Ovo je broj: {detaljiKontakta.ime}, a njegov broj je: {detaljiKontakta.broj}</h2>
            </>:''
        }
        </>
    )
}
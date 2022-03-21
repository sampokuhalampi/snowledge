/**
Käyttäjien hallintanäkymä
Tarkoituksena listata käyttäjät, muokata, poistaa ja lisätä niitä.

Luonut: Markku Nirkkonen 18.12.2020

Viimeisimmät muutokset:

Markku Nirkkonen 10.1.2021
Admin voi muuttaa muiden käyttäjien salasanoja

Markku Nirkkonen 29.12.2020
Käyttäjien muokkaustoiminnot näkyvät vain, jos kirjautuneen käyttäjän rooli on admin

Markku Nirkkonen 19.12.2020
Muokkaaminen ja poistaminen toimivat.

**/
import * as React from "react";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import { useEffect } from "react";
import AddUser from "./AddUser";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import InputAdornment from "@material-ui/core/InputAdornment";


const useStyles = makeStyles((theme) => ({
  userCard: {
    padding: theme.spacing(1),
    maxWidth: 400,
    margin: "auto",
    marginTop: 10
  },
  cardContainer: {
    flexGrow: 1,
    marginTop: 10,
  },
  coordinateInputs: {
    display: "flex"
  },
}));

function UserManage(props) {

  const classes = useStyles();

  // Hooks
  const [anchorElMenu, setAnchorElMenu] = React.useState(null); 
  const [selected, setSelected] = React.useState(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [firstName, setFirstName] = React.useState(null);
  const [lastName, setLastName] = React.useState(null);
  const [email, setEmail] = React.useState(null);
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [mismatch, setMismatch] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [initials, setInitials] = React.useState(null);
  const [users, setUsers] = React.useState(null);
  
  const menuOpen = Boolean(anchorElMenu);

  // Muokkauslomakkeen voi lähettää, jos salasana tyhjä (ei muuteta) tai vähintään 7 merkkiä
  const editFormOK = (password.length >= 7 || password === "");

  // Käyttäjätietojen automaattinen haku, kun komponentti on renderöity
  useEffect(() => {
    fetchUsers();
  }, []);
  
  /*
   * Event handlers
   */

  // Käyttäjät päivitetään
  const fetchUsers = async () => {
    const users = await fetch("api/user/all",
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + props.token
        }
      });
    const usersdata = await users.json();

    setUsers(usersdata);
  };
   
  // Käyttäjän valikon avaaminen, tarkentaa samalla valitun käyttäjän 
  const handleMenu = (event, item) => {
    setSelected(item);

    // Alkuperäisten arvojen alustaminen muutosten perumista varten
    if (!editOpen) {
      var initialName = item.Etunimi;
      var initialLastname = item.Sukunimi;
      var initialEmail = item.Sähköposti;

      setInitials(
        {
          Etunimi: initialName,
          Sukunimi: initialLastname,
          Sähköposti: initialEmail
        }
      );
    }
    setAnchorElMenu(event.currentTarget);
  };
    
  // Menun sulkeminen nollaa valitun käyttäjän
  const handleMenuClose = () => {
    setAnchorElMenu(null);
    setSelected(null);
    setInitials(null);
  };
  
  // Käyttäjän poiston api-kutsu
  const handleDelete = () => {
    const fetchDelete = async () => {
      await fetch("api/user/" + selected.ID,
        {
          method: "DELETE",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + props.token
          }
        });
    };
    fetchDelete();

    // Poiston jälkeen käyttäjätiedot päivitetään
    fetchUsers();

    closeDelete();
  };
  
  // avataan käyttäjän poistodialogi
  const openDelete = () => {
    setDeleteOpen(true);
  };

  // Suljetaan poistodialogi ja nollataan käyttäjän valinta
  const closeDelete = () => {
    setAnchorElMenu(null);
    setDeleteOpen(false);
    setSelected(null);
    setInitials(null);
  };

  // Käsitellään käyttäjän muokkaus
  const handleEdit = () => {

    if (password === confirm) {
      // Tiedot  tulevat hookeista
      const data = {
        Etunimi: firstName === null ? initials.Etunimi : firstName,
        Sukunimi: lastName === null ? initials.Sukunimi : lastName,
        Sähköposti: email === null ? initials.Sähköposti : email,
        ID: selected.ID
      };
      if (password !== "") {
        data.Salasana = password;
      }

      // Käyttäjän muokkaamisen api-kutsu
      const fetchEditUser = async () => {
        const response = await fetch("api/user/"+selected.ID,
          {
            method: "PUT",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              Authorization: "Bearer " + props.token
            },
            body: JSON.stringify(data),
          });
        const res = await response.json();
        console.log(res);
      };
      fetchEditUser();
      
      // Käyttäjät haetaan uudelleen muutoksien jälkeen
      fetchUsers();
      
      setAnchorElMenu(null);
      closeEdit();
    } else {
      setMismatch(true);
    }
  };

  // Avataan muokkausdialogi
  const openEdit = () => {
    setEditOpen(true);
  };

  // Kun muokkausdialogi suljetaan, nollataan valinnat ja suljetaan dialogi
  const closeEdit = () => {
    setFirstName(null);
    setLastName(null);
    setEmail(null);
    setInitials(null);
    setAnchorElMenu(null);
    setEditOpen(false);
    setSelected(null);
    setPassword("");
    setConfirm("");
    setMismatch(false);
  };

  // etunimen päivitys
  const updateFirstName = (event) => {
    if (event.target.value === "") {
      setFirstName(initials.Etunimi);
    } else {
      setFirstName(event.target.value);
    }
  };

  // sukunimen päivitys
  const updateLastName = (event) => {
    if (event.target.value === "") {
      setLastName(initials.Sukunimi);
    } else {
      setLastName(event.target.value);
    }
  };

  // sähköpostin päivittäminen
  const updateEmail = (event) => {
    if (event.target.value === "") {
      setEmail(initials.Email);
    } else {
      setEmail(event.target.value);
    }
  };

  // Vaihtaa salasanakentän näkyvyyden (päälle/pois)
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // Päivitetään salasanaa, kun sen arvo muuttuu
  const updatePassword = (event) => {
    setPassword(event.target.value);
  };

  // Päivitetään varmennetta, kun sitä muutetaan
  const updateConfirm = (event) => {
    setConfirm(event.target.value);
  };

  // Renderöinti
  
  // Vain admin-käyttäjä näkee muokkaustoiminnot
  if (props.role === "admin") {
    return (  
      <div>
  
        {/* Painike, mistä voi lisätä segmentin */}
        <Box>
          <AddUser token={props.token} fetchUsers={fetchUsers} />
        </Box>
        
        {/* Käyttäjäkortit */}
        <Box className={classes.cardContainer}>
          <Grid container spacing={0}> 
            
            {/* Luodaan jokaiselle käyttäjälle oma kortti */}
            {
              users === null 
                ? 
                <div />
                :
                users.map((item, index) => {
                  return (
                    <Grid key={index} item xs={12} sm={4}>
                      <Card className={classes.userCard}>
                        <CardHeader 
                          title={item.Etunimi + " " +item.Sukunimi}
                          subheader={item.Sähköposti}
                          action={
                            <IconButton id={item.ID} aria-label="close" onClick={(event) => handleMenu(event, item)}>
                              <MoreVertIcon />
                            </IconButton>
                          }
                        />
                      
                        {/* Valikko kortin lisätoiminnoille */}
                        <Menu           
                          anchorEl={anchorElMenu}
                          anchorOrigin={{
                            vertical: "top",
                            horizontal: "right",
                          }}
                          keepMounted
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                          }}
                          open={menuOpen}
                          onClose={handleMenuClose}
                        > 
                          <MenuItem onClick={openEdit}>
                          Muokkaa
                          </MenuItem>
                          <Divider />
                          <MenuItem onClick={() => openDelete()}>
                          Poista
                          </MenuItem>
                        </Menu>
  
                        <CardContent>
  
                          <Typography variant="body1" color="textSecondary" align="left" component="p">
                            {item.Rooli !== null ? "Rooli: " + item.Rooli: "Ei määriteltyä roolia"}
                          </Typography>
  
                        </CardContent>
                      </Card>                 
                    </Grid>
                  );
                })
            }  
          </Grid>   
        </Box>
      
        {/* Käyttäjän poistodialogi */}
        <Dialog 
          onClose={closeDelete} 
          open={deleteOpen}
        >
          <DialogTitle id="delete_user">Poista käyttäjä?</DialogTitle>
          <Typography>Poistetaan käyttäjä ja kaikki käyttäjään liittyvät tiedot. Poista?</Typography>
          <DialogActions>
            <Divider />
            <Button id={"deleteClose"} onClick={closeDelete}>Peruuta</Button>
            <Button variant="contained" color="primary" id={"delete"} onClick={handleDelete}>Poista</Button>
          </DialogActions>
      
        </Dialog>
      
        {/* Muokkausdialogi (lomake) */}
        <Dialog 
          onClose={closeEdit} 
          open={editOpen}
        >
          <DialogTitle id="edit_user">Muokkaa käyttäjää</DialogTitle>
          <Typography variant="caption">Jätä tyhjäksi kentät, joita ei muuteta</Typography>
          <Typography variant="caption">Uuden salasanan tulee olla vähintään 7 merkkiä pitkä</Typography>
          <FormControl>  
            <InputLabel htmlFor="firstname" >Muuta etunimeä</InputLabel>
            <Input
              id="firstname"
              type='text'
              onChange={updateFirstName}
              placeholder={selected !== null ? selected.Etunimi : ""}
            />
          </FormControl>
          <FormControl>  
            <InputLabel htmlFor="lastname" >Muuta sukunimeä</InputLabel>
            <Input
              id="lastname"
              type='text'
              onChange={updateLastName}
              placeholder={selected !== null ? selected.Sukunimi : ""}
            />
          </FormControl>
          <FormControl>  
            <InputLabel htmlFor="email" >Muuta sähköpostia</InputLabel>
            <Input
              id="email"
              type='text'
              onChange={updateEmail}
              placeholder={selected !== null ? selected.Sähköposti : ""}
            />
          </FormControl>
          <FormControl error={mismatch}>
            <InputLabel htmlFor="standard-adornment-password">Uusi salasana</InputLabel>
            <Input
              id="standard-adornment-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={updatePassword}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          {mismatch ? <FormHelperText>Salasana ja vahvistus eivät täsmää</FormHelperText> : <div />}
          
          <FormControl error={mismatch}>
            <InputLabel htmlFor="confirm">Vahvista uusi salasana</InputLabel>
            <Input
              id="confirm"
              type='password'
              value={confirm}
              onChange={updateConfirm}
            />
          </FormControl>
  
          <DialogActions>
            <Divider />
            <Button id={"editClose"} onClick={closeEdit}>Peruuta</Button>
            <Button variant="contained" color="primary" id={"save_edit"} onClick={handleEdit} disabled={!editFormOK}>Tallenna muutokset</Button>
          </DialogActions>
        
        </Dialog>
      </div>
    );
  } else {
    
    // Operator-tason käyttäjä ei voi hallita muita käyttäjiä
    return (
      <Typography variant="h6">Käyttäjähallinta vaatii admin-oikeudet</Typography>
    );
  }
  
}

export default UserManage;
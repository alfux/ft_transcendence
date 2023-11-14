export interface ProfileViewProps
{
  login:string,
  image:string
}

export function ProfileView(props:ProfileViewProps)
{
  const pp_style = {
    backgroundImage: `url("${props.image}")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "50% 50%",
    backgroundSize: "100%",
    borderRadius: "50%",
    height: "100px",
    width: "100px",
  };

  return (

    <div>
      login: {props.login}
      <div style={pp_style}/>
    </div>

  )
}
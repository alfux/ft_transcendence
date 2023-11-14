import React, { useEffect, useState } from "react"
import "../fonts/fonts.css"
import "./Sidebar.css"

export type ProfileSidebarSections = ('profile' | 'chat' | 'debug')

interface ProfileSidebarProps
{
  setActiveSection: (state:ProfileSidebarSections) => void,
}

interface ProfileSidebarSectionProps
{
  onClick: () => void,
  className: string
}

function ProfileSidebarSection(props:ProfileSidebarSectionProps)
{
  return (
    <li className={"sidebar-element"}>
      <a onClick={props.onClick}>
      <span className={props.className}/>
      </a>
    </li>
  )
}

export function ProfileSidebar(props: ProfileSidebarProps)
{
  const [selectedSection, setSelectedSection] = useState<ProfileSidebarSections>('profile');

  const handleSectionClick = (section: ProfileSidebarSections) => {
    props.setActiveSection(section);
    setSelectedSection(section);
  };

  return (
    <div className={"sidebar"}>
      <ul className={"sidebar-list"}>

        <li className={"sidebar-element"}>
          <img className={"sidebar-icon sidebar-42-icon"} alt="42" src="https://meta.intra.42.fr/assets/42_logo-7dfc9110a5319a308863b96bda33cea995046d1731cebb735e41b16255106c12.svg"/>
        </li>

        <ProfileSidebarSection onClick={() => handleSectionClick('profile')}
          className={`sidebar-icon sidebar-icon-profile ${selectedSection === 'profile' ? 'selected' : ''}`}/>

        <ProfileSidebarSection onClick={() => handleSectionClick('chat')}
          className={`sidebar-icon sidebar-icon-chat ${selectedSection === 'chat' ? 'selected' : ''}`}/>

        <ProfileSidebarSection onClick={() => handleSectionClick('debug')}
          className={`sidebar-icon sidebar-icon-debug ${selectedSection === 'debug' ? 'selected' : ''}`}/>

      </ul>
    </div>
  )

}
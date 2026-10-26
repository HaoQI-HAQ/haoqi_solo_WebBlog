import SiteSoundToggle from '../audio/SiteSoundToggle.jsx';

export default function WorkSoundToggle(props) {
  return <SiteSoundToggle {...props} className={`work-sound-toggle ${props.className || ''}`} />;
}

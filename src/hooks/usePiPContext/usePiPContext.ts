import { useContext } from 'react';
import { PiPContext } from '../../components/PiPProvider';
//import { ParticipantContext } from '../../components/ParticipantProvider';

export default function usePiPContext() {
  const context = useContext(PiPContext);
  //const context = useContext(ParticipantContext);
  //let context=null;
  console.log(context);
  if (!context) {
    throw new Error('usePiPWindowContext must be used within a PiPProvider');
  }
  return context;
}

import React from 'react';
import { Participant, Track } from 'twilio-video';
import Publication from '../Publication/Publication';
import usePublications from '../../hooks/usePublications/usePublications';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';

interface ParticipantTracksProps {
  participant: Participant;
  videoOnly?: boolean;
  enableScreenShare?: boolean;
  videoPriority?: Track.Priority | null;
  isLocalParticipant?: boolean;
  trackToShow: string;
}

/*
 *  The object model for the Room object (found here: https://www.twilio.com/docs/video/migrating-1x-2x#object-model) shows
 *  that Participant objects have TrackPublications, and TrackPublication objects have Tracks.
 *
 *  The React components in this application follow the same pattern. This ParticipantTracks component renders Publications,
 *  and the Publication component renders Tracks.
 */

export default function ParticipantTracks({
  participant,
  videoOnly,
  enableScreenShare,
  videoPriority,
  isLocalParticipant,
  trackToShow,
}: ParticipantTracksProps) {
  const publications = usePublications(participant);
  publications.forEach(p => console.log(p.trackName));
  let filteredPublications;
  //let {extraVideoTrack} = useVideoContext();
  //const { room, localTracks, getLocalVideoTrack, removeLocalVideoTrack, onError } = useVideoContext();

  /*if (enableScreenShare && publications.some(p => p.trackName.includes('screen'))) {
    // When displaying a screenshare track is allowed, and a screen share track exists,
    // remove all video tracks without the name 'screen'.
    filteredPublications = publications.filter(p => p.trackName.includes('screen') || p.kind !== 'video');
  } else {
    // Else, remove all screenshare tracks
    filteredPublications = publications.filter(p => !p.trackName.includes('screen'));
  }*/
  /*if (isLocalParticipant) {
    filteredPublications=[extraVideoTrack];
  }*/
  filteredPublications = publications.filter(p => p.trackName.includes(trackToShow) || p.kind !== 'video');
  //filteredPublications = [filteredPublications[0]];

  return (
    <>
      {filteredPublications.map((publication, index) => (
        <Publication
          key={index}
          publication={publication}
          participant={participant}
          isLocalParticipant={isLocalParticipant}
          videoOnly={videoOnly}
          videoPriority={videoPriority}
        />
      ))}
    </>
  );
}

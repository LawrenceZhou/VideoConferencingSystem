/* istanbul ignore file */
import React from 'react';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';
import { Participant } from 'twilio-video';
import throttle from 'lodash.throttle';
import { withStyles, WithStyles, createStyles } from '@material-ui/core/styles';

const styles = createStyles({
  outerContainer: {
    minHeight: 0,
    flex: 1,
    position: 'relative',
  },
  innerScrollContainer: {
    height: '100%',
    overflowY: 'auto',
    padding: '0 1.2em 0',
  },
  participantListContainer: {
    overflowY: 'auto',
    flex: '1',
    paddingBottom: '1em',
  },
  button: {
    position: 'absolute',
    bottom: '14px',
    right: '2em',
    zIndex: 100,
    padding: '0.5em 0.9em',
    visibility: 'hidden',
    opacity: 0,
    boxShadow: '0px 4px 16px rgba(18, 28, 45, 0.2)',
    transition: 'all 0.5s ease',
  },
  showButton: {
    visibility: 'visible',
    opacity: 1,
    bottom: '24px',
  },
});

interface ParticipantListScrollContainerProps extends WithStyles<typeof styles> {
  participants: Participant[];
}

interface ParticipantListScrollContainerState {
  isScrolledToBottom: boolean;
  showButton: boolean;
  participantNotificationCount: number;
}

/*
 * This component is a scrollable container that wraps around the 'ParticipantList' component.
 * The ParticipantList will ultimately grow taller than its container as it continues to receive
 * new participants, and users will need to have the ability to scroll up and down the participant window.
 * A "new participant" button will be displayed when the user receives a new participant, and is not scrolled
 * to the bottom. This button will be hidden if the user clicks on it, or manually scrolls
 * to the bottom. Otherwise, this component will auto-scroll to the bottom when a new participant is
 * received, and the user is already scrolled to the bottom.
 *
 * Note that this component is tested with Cypress only.
 */
export class ParticipantListScrollContainer extends React.Component<
  ParticipantListScrollContainerProps,
  ParticipantListScrollContainerState
> {
  participantThreadRef = React.createRef<HTMLDivElement>();
  state = { isScrolledToBottom: true, showButton: false, participantNotificationCount: 0 };

  scrollToBottom() {
    const innerScrollContainerEl = this.participantThreadRef.current!;
    innerScrollContainerEl.scrollTop = innerScrollContainerEl!.scrollHeight;
  }

  componentDidMount() {
    this.scrollToBottom();
    this.participantThreadRef.current!.addEventListener('scroll', this.handleScroll);
  }

  // This component updates as users send new participants:
  componentDidUpdate(prevProps: ParticipantListScrollContainerProps, prevState: ParticipantListScrollContainerState) {
    const hasNewParticipants = this.props.participants.length !== prevProps.participants.length;

    if (prevState.isScrolledToBottom && hasNewParticipants) {
      this.scrollToBottom();
    } else if (hasNewParticipants) {
      const numberOfNewParticipants = this.props.participants.length - prevProps.participants.length;

      this.setState(previousState => ({
        // If there's at least one new participant, show the 'new participant' button:
        showButton: !previousState.isScrolledToBottom,
        // If 'new participant' button is visible,
        // participantNotificationCount will be the number of previously unread participants + the number of new participants.
        // Otherwise, participantNotificationCount is set to 1:
        participantNotificationCount: previousState.showButton
          ? previousState.participantNotificationCount + numberOfNewParticipants
          : 1,
      }));
    }
  }

  handleScroll = throttle(() => {
    const innerScrollContainerEl = this.participantThreadRef.current!;
    // Because this.handleScroll() is a throttled method,
    // it's possible that it can be called after this component unmounts, and this element will be null.
    // Therefore, if it doesn't exist, don't do anything:
    if (!innerScrollContainerEl) return;

    // On systems using display scaling, scrollTop may return a decimal value, so we need to account for this in the
    // "isScrolledToBottom" calculation.
    const isScrolledToBottom =
      Math.abs(
        innerScrollContainerEl.clientHeight + innerScrollContainerEl.scrollTop - innerScrollContainerEl!.scrollHeight
      ) < 1;

    this.setState(prevState => ({
      isScrolledToBottom,
      showButton: isScrolledToBottom ? false : prevState.showButton,
    }));
  }, 300);

  handleClick = () => {
    const innerScrollContainerEl = this.participantThreadRef.current!;

    innerScrollContainerEl.scrollTo({ top: innerScrollContainerEl.scrollHeight, behavior: 'smooth' });

    this.setState({ showButton: false });
  };

  componentWillUnmount() {
    const innerScrollContainerEl = this.participantThreadRef.current!;

    innerScrollContainerEl.removeEventListener('scroll', this.handleScroll);
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.outerContainer}>
        <div
          className={classes.innerScrollContainer}
          ref={this.participantThreadRef}
          data-cy-participant-list-inner-scroll
        >
          <div className={classes.participantListContainer}>
            {this.props.children}
            <Button
              className={clsx(classes.button, { [classes.showButton]: this.state.showButton })}
              onClick={this.handleClick}
              startIcon={<ArrowDownwardIcon />}
              color="primary"
              variant="contained"
              data-cy-new-participant-button
            >
              {this.state.participantNotificationCount} new participant
              {this.state.participantNotificationCount > 1 && 's'}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(ParticipantListScrollContainer);

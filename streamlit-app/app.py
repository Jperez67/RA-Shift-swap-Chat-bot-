import pandas as pd
import streamlit as st


st.set_page_config(page_title="RA Scheduling Assistant", layout="wide")


RA_NAMES = [
    "Alex Rivera",
    "Brianna Chen",
    "Chris Patel",
    "Dana Brooks",
    "Elliot Morgan",
]


def build_mock_weekend_schedule() -> pd.DataFrame:
    return pd.DataFrame(
        [
            {"Date": "Friday", "Shift Slot": "8:00 PM - 12:00 AM", "RA": "Alex Rivera", "Building": "Hope Hall"},
            {"Date": "Saturday", "Shift Slot": "12:00 PM - 4:00 PM", "RA": "Brianna Chen", "Building": "Butterfield"},
            {"Date": "Saturday", "Shift Slot": "8:00 PM - 12:00 AM", "RA": "Chris Patel", "Building": "Hillside"},
            {"Date": "Sunday", "Shift Slot": "4:00 PM - 8:00 PM", "RA": "Dana Brooks", "Building": "Hope Hall"},
        ]
    )


def build_mock_master_schedule() -> pd.DataFrame:
    return pd.DataFrame(
        [
            {"Date": "2026-05-04", "Shift Slot": "8:00 PM - 12:00 AM", "Assigned RA": "Alex Rivera", "Status": "Confirmed"},
            {"Date": "2026-05-05", "Shift Slot": "8:00 PM - 12:00 AM", "Assigned RA": "Brianna Chen", "Status": "Confirmed"},
            {"Date": "2026-05-06", "Shift Slot": "6:00 PM - 10:00 PM", "Assigned RA": "Chris Patel", "Status": "Needs Backup"},
            {"Date": "2026-05-07", "Shift Slot": "8:00 PM - 12:00 AM", "Assigned RA": "Dana Brooks", "Status": "Confirmed"},
            {"Date": "2026-05-08", "Shift Slot": "8:00 PM - 12:00 AM", "Assigned RA": "Elliot Morgan", "Status": "Confirmed"},
        ]
    )


def build_mock_swap_requests() -> pd.DataFrame:
    return pd.DataFrame(
        [
            {
                "Request ID": "SW-1042",
                "Date": "2026-05-09",
                "Current RA": "Alex Rivera",
                "Replacement RA": "Dana Brooks",
                "Status": "Pending Approval",
            },
            {
                "Request ID": "SW-1043",
                "Date": "2026-05-11",
                "Current RA": "Chris Patel",
                "Replacement RA": "Elliot Morgan",
                "Status": "Draft",
            },
        ]
    )


def build_mock_audit_log() -> pd.DataFrame:
    return pd.DataFrame(
        [
            {"Timestamp": "2026-05-03 09:12 AM", "Actor": "System", "Action": "Imported Google Form responses"},
            {"Timestamp": "2026-05-03 09:18 AM", "Actor": "Admin", "Action": "Published weekly duty schedule"},
            {"Timestamp": "2026-05-03 10:05 AM", "Actor": "Brianna Chen", "Action": "Submitted shift swap request"},
        ]
    )


def create_mock_swap_request(current_user: str) -> dict:
    # Future API call: create a draft swap request in Google Sheets or Apps Script.
    return {
        "Date": "2026-05-09",
        "Shift Slot": "8:00 PM - 12:00 AM",
        "Current Assigned RA": current_user,
        "Replacement RA": "Dana Brooks",
        "Reason": "Mock request created from chat for demo purposes.",
    }


def get_mock_response(prompt: str, current_user: str) -> str:
    normalized_prompt = prompt.lower()

    if "weekend" in normalized_prompt:
        return (
            "Here is the sample weekend schedule:\n\n"
            "- Friday, 8:00 PM - 12:00 AM: Alex Rivera in Hope Hall\n"
            "- Saturday, 12:00 PM - 4:00 PM: Brianna Chen in Butterfield\n"
            "- Saturday, 8:00 PM - 12:00 AM: Chris Patel in Hillside\n"
            "- Sunday, 4:00 PM - 8:00 PM: Dana Brooks in Hope Hall"
        )

    if "swap" in normalized_prompt:
        st.session_state.pending_swap = create_mock_swap_request(current_user)
        return "I prepared a pending swap request for review. Confirm or cancel it below."

    return (
        "I can help answer schedule questions, prepare mock shift swaps, and show where future "
        "Google Sheets, Forms, Calendar, or Apps Script syncs will plug in."
    )


if "messages" not in st.session_state:
    st.session_state.messages = [
        {
            "role": "assistant",
            "content": "Hi! Ask me about the schedule, weekend coverage, or a shift swap.",
        }
    ]

if "pending_swap" not in st.session_state:
    st.session_state.pending_swap = None

if "status_message" not in st.session_state:
    st.session_state.status_message = None


with st.sidebar:
    st.header("Controls")
    current_user = st.selectbox("Current User", RA_NAMES)
    role = st.selectbox("Role", ["RA", "SRA", "Admin"])

    st.divider()
    st.subheader("Quick Actions")

    if st.button("View Today's Schedule", use_container_width=True):
        st.session_state.messages.append(
            {"role": "assistant", "content": f"{current_user}, your mock shift today is 8:00 PM - 12:00 AM in Hope Hall."}
        )

    if st.button("View Weekend Schedule", use_container_width=True):
        st.session_state.messages.append(
            {"role": "assistant", "content": get_mock_response("weekend", current_user)}
        )

    if role in ["SRA", "Admin"]:
        if st.button("Sync Calendar", use_container_width=True):
            # Future API call: trigger Google Calendar sync through Apps Script.
            st.success("Mock calendar sync queued.")

        if st.button("Rebuild Schedule", use_container_width=True):
            # Future API call: trigger the scheduling algorithm or Apps Script rebuild.
            st.success("Mock schedule rebuild started.")


st.title("RA Scheduling Assistant")
st.write(
    "A demo assistant for answering schedule questions, preparing shift swaps, and syncing "
    "schedule tools across Google Sheets, Google Forms, Google Calendar, and Apps Script."
)

if st.session_state.status_message:
    message_type, message_text = st.session_state.status_message
    if message_type == "success":
        st.success(message_text)
    else:
        st.info(message_text)
    st.session_state.status_message = None

summary_col, swap_col, sync_col = st.columns(3)
summary_col.metric("Open Shifts", "2")
swap_col.metric("Pending Swaps", "3")
sync_col.metric("Last Mock Sync", "Today 9:12 AM")

st.divider()

chat_container, context_container = st.columns([2, 1])

with chat_container:
    st.header("Assistant Chat")
    chat_box = st.container(height=430)

    with chat_box:
        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                st.markdown(message["content"])

    prompt = st.chat_input("Ask about schedules, swaps, or coverage")

    if prompt:
        st.session_state.messages.append({"role": "user", "content": prompt})
        response = get_mock_response(prompt, current_user)
        st.session_state.messages.append({"role": "assistant", "content": response})
        st.rerun()

with context_container:
    st.header("Demo Context")
    st.info(f"Signed in as {current_user} with {role} permissions.")
    st.caption("Backend connections are mocked for now.")

    if role == "RA":
        st.write("RA users can view schedule details and prepare swap requests.")
    else:
        st.write("SRA and Admin users can also queue calendar syncs and schedule rebuilds.")


if st.session_state.pending_swap:
    st.subheader("Pending Swap Request")
    with st.container(border=True):
        pending_swap = st.session_state.pending_swap
        detail_col, action_col = st.columns([3, 1])

        with detail_col:
            st.write(f"**Date:** {pending_swap['Date']}")
            st.write(f"**Shift Slot:** {pending_swap['Shift Slot']}")
            st.write(f"**Current Assigned RA:** {pending_swap['Current Assigned RA']}")
            st.write(f"**Replacement RA:** {pending_swap['Replacement RA']}")
            st.write(f"**Reason:** {pending_swap['Reason']}")

        with action_col:
            if st.button("Confirm", use_container_width=True):
                # Future API call: submit confirmed swap to Apps Script or Google Sheets.
                st.session_state.pending_swap = None
                st.session_state.status_message = ("success", "Mock swap request confirmed.")
                st.rerun()

            if st.button("Cancel", use_container_width=True):
                st.session_state.pending_swap = None
                st.session_state.status_message = ("info", "Mock swap request cancelled.")
                st.rerun()


st.divider()
st.header("Schedule Data")

master_tab, swaps_tab, audit_tab = st.tabs(["Master Schedule", "Swap Requests", "Audit Log"])

with master_tab:
    # Future API call: load master schedule rows from Google Sheets.
    st.dataframe(build_mock_master_schedule(), use_container_width=True, hide_index=True)

with swaps_tab:
    # Future API call: load live swap requests from Google Forms or Google Sheets.
    st.dataframe(build_mock_swap_requests(), use_container_width=True, hide_index=True)

with audit_tab:
    # Future API call: load sync and approval events from Apps Script logs.
    st.dataframe(build_mock_audit_log(), use_container_width=True, hide_index=True)

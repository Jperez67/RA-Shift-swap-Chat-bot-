import os
import pandas as pd
import requests
import streamlit as st


st.set_page_config(page_title="RA Scheduling Assistant", layout="wide")


DEFAULT_RA_NAMES = [
    "Alex Rivera",
    "Brianna Chen",
    "Chris Patel",
    "Dana Brooks",
    "Elliot Morgan",
]


def get_api_url() -> str:
    secret_url = st.secrets.get("GOOGLE_APPS_SCRIPT_WEB_APP_URL", "")
    return secret_url or os.getenv("GOOGLE_APPS_SCRIPT_WEB_APP_URL", "")


API_URL = get_api_url()


def call_backend(payload: dict) -> dict:
    if not API_URL:
        raise RuntimeError(
            "Missing Google Apps Script web app URL. Add GOOGLE_APPS_SCRIPT_WEB_APP_URL "
            "to Streamlit secrets or your environment."
        )

    response = requests.post(API_URL, json=payload, timeout=90)
    response.raise_for_status()

    data = response.json()
    if not data.get("ok", True):
        raise RuntimeError(data.get("error") or "Google Apps Script returned an error.")

    return data


def send_message_to_backend(message: str, current_user: str, role: str) -> str:
    data = call_backend(
        {
            "action": "chat",
            "message": message,
            "currentUser": current_user,
            "role": role,
        }
    )
    return data.get("reply", "No reply returned from Google Apps Script.")


def run_backend_action(action: str, current_user: str, role: str) -> str:
    data = call_backend(
        {
            "action": action,
            "currentUser": current_user,
            "role": role,
        }
    )
    return data.get("reply", "Action completed.")


def load_backend_table(action: str) -> pd.DataFrame:
    try:
        data = call_backend({"action": action})
    except Exception as error:
        st.warning(str(error))
        return pd.DataFrame()

    return pd.DataFrame(data.get("rows", []))


@st.cache_data(ttl=60)
def load_roster_names() -> list[str]:
    if not API_URL:
        return DEFAULT_RA_NAMES

    try:
        data = call_backend({"action": "get_roster"})
    except Exception:
        return DEFAULT_RA_NAMES

    names = [
        str(row.get("Name", "")).strip()
        for row in data.get("rows", [])
        if str(row.get("Name", "")).strip()
    ]
    return names or DEFAULT_RA_NAMES


if "messages" not in st.session_state:
    st.session_state.messages = [
        {
            "role": "assistant",
            "content": "Hi! Ask me about the schedule, weekend coverage, or a shift swap.",
        }
    ]

if "status_message" not in st.session_state:
    st.session_state.status_message = None


with st.sidebar:
    st.header("Controls")
    current_user = st.selectbox("Current User", load_roster_names())
    role = st.selectbox("Role", ["RA", "SRA", "Admin"])

    st.divider()
    st.subheader("Quick Actions")

    if st.button("View Today's Schedule", use_container_width=True):
        try:
            reply = send_message_to_backend("Who is on duty today?", current_user, role)
            st.session_state.messages.append({"role": "assistant", "content": reply})
            st.rerun()
        except Exception as error:
            st.error(str(error))

    if st.button("View Weekend Schedule", use_container_width=True):
        try:
            reply = send_message_to_backend("Show me this weekend's schedule.", current_user, role)
            st.session_state.messages.append({"role": "assistant", "content": reply})
            st.rerun()
        except Exception as error:
            st.error(str(error))

    if role in ["SRA", "Admin"]:
        if st.button("Sync Calendar", use_container_width=True):
            try:
                reply = run_backend_action("sync_calendar", current_user, role)
                st.success(reply)
            except Exception as error:
                st.error(str(error))

        if st.button("Rebuild Schedule", use_container_width=True):
            try:
                reply = run_backend_action("rebuild_schedule", current_user, role)
                st.success(reply)
            except Exception as error:
                st.error(str(error))


st.title("RA Scheduling Assistant")
st.write(
    "Ask schedule questions, prepare shift swaps, and sync schedule tools through Google Apps Script."
)

if not API_URL:
    st.warning(
        "Connect your deployed Apps Script web app by setting "
        "GOOGLE_APPS_SCRIPT_WEB_APP_URL in Streamlit secrets or as an environment variable."
    )

if st.session_state.status_message:
    message_type, message_text = st.session_state.status_message
    if message_type == "success":
        st.success(message_text)
    else:
        st.info(message_text)
    st.session_state.status_message = None

summary_col, swap_col, sync_col = st.columns(3)
summary_col.metric("Backend", "Connected" if API_URL else "Missing URL")
swap_col.metric("Current User", current_user)
sync_col.metric("Role", role)

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
        try:
            response = send_message_to_backend(prompt, current_user, role)
        except Exception as error:
            response = f"Backend request failed: {error}"

        st.session_state.messages.append({"role": "assistant", "content": response})
        st.rerun()

with context_container:
    st.header("Live Context")
    st.info(f"Signed in as {current_user} with {role} permissions.")
    st.caption("Chat and table data are loaded from Google Apps Script.")

    if role == "RA":
        st.write("RA users can view schedule details and request shift swaps.")
    else:
        st.write("SRA and Admin users can also queue calendar syncs and schedule rebuilds.")


st.divider()
st.header("Schedule Data")

master_tab, swaps_tab, audit_tab = st.tabs(["Master Schedule", "Swap Requests", "Audit Log"])

with master_tab:
    if API_URL:
        st.dataframe(load_backend_table("get_master_schedule"), use_container_width=True, hide_index=True)
    else:
        st.info("Set the Apps Script web app URL to load MasterSchedule rows.")

with swaps_tab:
    if API_URL:
        st.dataframe(load_backend_table("get_swap_requests"), use_container_width=True, hide_index=True)
    else:
        st.info("Set the Apps Script web app URL to load SwapRequests rows.")

with audit_tab:
    if API_URL:
        st.dataframe(load_backend_table("get_audit_log"), use_container_width=True, hide_index=True)
    else:
        st.info("Set the Apps Script web app URL to load AuditLog rows.")

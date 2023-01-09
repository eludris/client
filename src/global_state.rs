use perseus::{prelude::*, state::GlobalStateCreator};
use serde::{Deserialize, Serialize};
use todel::models::Message;

pub fn get_global_state_creator() -> GlobalStateCreator {
    GlobalStateCreator::new().build_state_fn(get_build_state)
}

#[engine_only_fn]
async fn get_build_state(_locale: String) -> AppState {
    AppState {
        name: None,
        messages: vec![],
    }
}

#[derive(Debug, Serialize, Deserialize, ReactiveState)]
#[rx(alias = "AppStateRx")]
pub struct AppState {
    pub name: Option<String>,
    pub messages: Vec<Message>,
}

#[cfg(client)]
impl AppStateRx {
    pub fn load_name(&self) {
        use web_sys::window;
        let storage = window().unwrap().local_storage().unwrap().unwrap();
        self.name.set(storage.get("name").unwrap());
    }

    pub fn set_name(&self, name: &str) {
        use web_sys::window;
        let storage = window().unwrap().local_storage().unwrap().unwrap();
        storage.set("name", name).unwrap();
        self.name.set(Some(name.to_string()));
    }

    pub fn reset_name(&self) {
        use web_sys::window;
        let storage = window().unwrap().local_storage().unwrap().unwrap();
        storage.delete("name").unwrap();
        self.name.set(None);
    }

    pub fn get_name(&self) -> Option<String> {
        self.name.get().as_ref().as_ref().map(|n| n.to_string())
    }
}

#[cfg(client)]
impl AppStateRx {
    pub fn start_websocket(&self) {
        use futures_util::{SinkExt, StreamExt};
        use gloo_net::websocket::futures::WebSocket;
        use gloo_net::websocket::Message as WebSocketMessage;
        use gloo_timers::future::IntervalStream;
        use sycamore::futures::spawn_local;
        use todel::models::Payload;

        let ws = WebSocket::open("wss://eludris.tooty.xyz/ws/").unwrap();
        let (mut tx, mut rx) = ws.split();
        spawn_local(async move {
            let mut stream = IntervalStream::new(45_000);
            loop {
                tx.send(WebSocketMessage::Text(
                    serde_json::to_string(&Payload::Ping).unwrap(),
                ))
                .await
                .unwrap();
                stream.next().await;
            }
        });
        let messages = self.messages.clone();
        spawn_local(async move {
            while let Some(Ok(WebSocketMessage::Text(msg))) = rx.next().await {
                if let Ok(Payload::MessageCreate(msg)) = serde_json::from_str(&msg) {
                    messages.modify().push(msg);
                }
            }
        })
    }
}

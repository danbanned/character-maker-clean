using UnityEngine;

public class WebController : MonoBehaviour
{
    public PlayerMovement player;

    public void SetInteractive(string state)
    {
        bool active = state == "true";

        if (player != null)
            player.isInteractive = active;

        Cursor.lockState = active ? CursorLockMode.Locked : CursorLockMode.None;
        Cursor.visible = !active;
    }
}
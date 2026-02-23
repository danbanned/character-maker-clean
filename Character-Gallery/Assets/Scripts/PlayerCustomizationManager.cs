using System.Runtime.InteropServices;
using UnityEngine;

public class PlayerCustomizationManager : MonoBehaviour
{
    #if UNITY_WEBGL && !UNITY_EDITOR
    [DllImport("__Internal")]
    private static extern void UnityReady();
    #endif

    public static PlayerCustomizationManager Instance;

    [Header("Body Part References")]
    public SkinnedMeshRenderer body;
    public SkinnedMeshRenderer hair;
    public SkinnedMeshRenderer eyes;
    public SkinnedMeshRenderer armor;

    void Awake()
    {
        // Singleton pattern
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;

        // JS SendMessage target must match this name exactly.
        if (gameObject.name != "PlayerCustomizationManager")
            gameObject.name = "PlayerCustomizationManager";

        DontDestroyOnLoad(gameObject);
        Debug.Log("PlayerCustomizationManager Awake");
    }

    void Start()
    {
        Debug.Log("PlayerCustomizationManager STARTED");

        #if UNITY_WEBGL && !UNITY_EDITOR
        UnityReady(); // Notify JS that Unity is ready
        #endif
    }

    // Called from JS
    public void ApplyCharacterData(string json)
    {
        Debug.Log("JSON RECEIVED: " + json);
        CharacterData data = JsonUtility.FromJson<CharacterData>(json);

        ApplyColor(body, data.skinColor);
        ApplyColor(hair, data.hairColor);
        ApplyColor(eyes, data.eyeColor);
        ApplyColor(armor, data.armorColor);

        Debug.Log($"Weapon: {data.weapon}, Accessory: {data.accessory}");
    }

    private void ApplyColor(SkinnedMeshRenderer rend, string hex)
    {
        if (rend == null) return;
        if (ColorUtility.TryParseHtmlString(hex, out Color color))
            rend.material.color = color;
    }

    public void TestMessage()
    {
        Debug.Log("TEST MESSAGE RECEIVED");
    }
}

[System.Serializable]
public class CharacterData
{
    public string skinColor;
    public string hairColor;
    public string hairStyle;
    public string eyeColor;
    public string armor;
    public string armorColor;
    public string weapon;
    public string accessory;
}

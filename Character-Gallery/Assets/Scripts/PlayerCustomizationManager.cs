using System.Runtime.InteropServices;
using UnityEngine;

public class PlayerCustomizationManager : MonoBehaviour
{
    
#if UNITY_WEBGL && !UNITY_EDITOR
    [DllImport("__Internal")]
    private static extern void UnityReady();
#endif

    public static PlayerCustomizationManager Instance;

    [Header("Core Renderers")]
    public SkinnedMeshRenderer body;
    public SkinnedMeshRenderer eyes;

    [Header("Hair Options")]
    public GameObject[] hairStyles;

    [Header("Clothing Options")]
    public GameObject[] topsOptions;
    public GameObject[] bottomsOptions;
    public GameObject[] shoesOptions;

    [Header("Equipment")]
    public GameObject[] weaponOptions;
    public GameObject[] accessoryOptions;

    void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }

        Instance = this;

        if (gameObject.name != "PlayerCustomizationManager")
            gameObject.name = "PlayerCustomizationManager";

        DontDestroyOnLoad(gameObject);
        Debug.Log("PlayerCustomizationManager Awake");
    }

    void Start()
    {
        Debug.Log("PlayerCustomizationManager STARTED");

#if UNITY_WEBGL && !UNITY_EDITOR
        UnityReady();
#endif
    }

    // =========================
    // MAIN ENTRY FROM WEB
    // =========================
    public void ApplyCharacterData(string json)
    {
        Debug.Log("JSON RECEIVED: " + json);
        CharacterData data = JsonUtility.FromJson<CharacterData>(json);

        // Colors
        ApplyColor(body, data.skinColor);
        ApplyColor(eyes, data.eyeColor);
        SetHairColor(data.hairColor);

        // Styles
        SetActiveByName(hairStyles, data.hairStyle);
        SetActiveByName(topsOptions, data.armorColor);
        SetActiveByName(bottomsOptions, data.armorColor);   // if linked
        SetActiveByName(shoesOptions, data.armorColor);     // if linked

        // Equipment
        SetActiveByName(weaponOptions, data.weapon);
        SetActiveByName(accessoryOptions, data.accessory);
    }

    // =========================
    // COLOR SYSTEM
    // =========================
    void ApplyColor(SkinnedMeshRenderer rend, string hex)
    {
        if (rend == null) return;

        if (ColorUtility.TryParseHtmlString(hex, out Color color))
        {
            foreach (Material mat in rend.materials)
            {
                if (mat.HasProperty("_BaseColor"))
                    mat.SetColor("_BaseColor", color);
                else if (mat.HasProperty("_Color"))
                    mat.color = color;
            }
        }
    }

    void SetHairColor(string hex)
    {
        if (hairStyles == null) return;

        foreach (GameObject hair in hairStyles)
        {
            if (!hair.activeSelf) continue;

            SkinnedMeshRenderer rend = hair.GetComponent<SkinnedMeshRenderer>();
            if (rend != null)
                ApplyColor(rend, hex);
        }
    }

    // =========================
    // GAMEOBJECT SWITCHING SYSTEM
    // =========================
    void SetActiveByName(GameObject[] options, string targetName)
    {
        if (options == null || options.Length == 0) return;

        foreach (GameObject obj in options)
            obj.SetActive(false);

        foreach (GameObject obj in options)
        {
            if (obj.name.ToLower() == targetName.ToLower())
            {
                obj.SetActive(true);
                return;
            }
        }

        Debug.LogWarning("Option not found: " + targetName);
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
    public string bodyType;
    public string armor;
    public string armorColor;
    public string weapon;
    public string accessory;
}
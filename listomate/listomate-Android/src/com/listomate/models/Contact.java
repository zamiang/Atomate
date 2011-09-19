package com.listomate.models;

/**
 * This is a full on contact that gets saved and synced to google
 * 
 */
public class Contact implements Comparable<Object> {
	 
	private String id;
    private String name;
    private String number;
    private String nickname;

    private String tag;
    
    private String email;
    private String photourl;
    private String phone;
    private Integer fbid;
    private String website;    
 
    public String getNumber() {
        return number;
    }
 
    public void setNumber(String number) {
        this.number = number;
    }
 
    public int compareTo(Object arg0) {
        Contact newCont = (Contact)arg0;
        return this.name.compareTo(newCont.getName());
    }

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getNickname() {
		return nickname;
	}

	public void setNickname(String nickname) {
		this.nickname = nickname;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPhotourl() {
		return photourl;
	}

	public void setPhotourl(String photourl) {
		this.photourl = photourl;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public Integer getFbid() {
		return fbid;
	}

	public void setFbid(Integer fbid) {
		this.fbid = fbid;
	}

	public String getWebsite() {
		return website;
	}

	public void setWebsite(String website) {
		this.website = website;
	}

	public String getTag() {
		return tag;
	}

	public void setTag(String tag) {
		this.tag = 	"@" + tag.replaceAll(" ", "").toLowerCase();
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}
}
package com.listomate;

public class Contact implements Comparable {
	 
    private String name;
    private String nickname;
    private String number;
    private Integer version;	
    private Integer created;
    private Integer edited;
    private Integer deleted;
    private String email;
    private String photourl;
    private String phone;
    private Integer fbid;
    private String website;
    private String tag;
    private Integer locationid;
    
 
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

	public Integer getVersion() {
		return version;
	}

	public void setVersion(Integer version) {
		this.version = version;
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

	public Integer getCreated() {
		return created;
	}

	public void setCreated(Integer created) {
		this.created = created;
	}

	public Integer getEdited() {
		return edited;
	}

	public void setEdited(Integer edited) {
		this.edited = edited;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public Integer getDeleted() {
		return deleted;
	}

	public void setDeleted(Integer deleted) {
		this.deleted = deleted;
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
		this.tag = tag;
	}

	public Integer getLocationid() {
		return locationid;
	}

	public void setLocationid(Integer locationid) {
		this.locationid = locationid;
	}
 
}